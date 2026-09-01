const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { detectColumnType, matchesType } = require('./dataTypeDetector');
const {
  safePct,
  round2,
  columnQualityStatus,
  computeColumnScore,
  computeDatasetScore,
} = require('./scoringService');

/**
 * Produces a "shape signature" for a string value, used to measure
 * formatting consistency within a column. e.g.
 *   "ABC-123"  -> "AAA-999"
 *   "abc-123"  -> "aaa-999"
 *   "2024-01-31" matches DATE regex path already, so shape isn't needed there.
 */
function shapeSignature(value) {
  return value
    .replace(/[A-Z]/g, 'A')
    .replace(/[a-z]/g, 'a')
    .replace(/[0-9]/g, '9');
}

function readDatasetRows(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  return records;
}

/**
 * Runs full profiling for a dataset file (CSV) and returns a structured
 * result: { datasetLevel, columns: [...], issues: [...] }
 */
function profileDataset(filePath) {
  const rows = readDatasetRows(filePath);
  const totalRows = rows.length;
  const columnNames = totalRows > 0 ? Object.keys(rows[0]) : [];
  const totalColumns = columnNames.length;
  const totalCells = totalRows * totalColumns;

  // Duplicate row detection (based on full-row value equality)
  const rowSignatures = new Map();
  rows.forEach((row) => {
    const sig = JSON.stringify(columnNames.map((c) => row[c]));
    rowSignatures.set(sig, (rowSignatures.get(sig) || 0) + 1);
  });
  let duplicateRows = 0;
  rowSignatures.forEach((count) => {
    if (count > 1) duplicateRows += count - 1;
  });

  const columns = [];
  const issues = [];

  let datasetMissing = 0;
  let datasetValid = 0;
  let datasetInvalid = 0;

  for (const colName of columnNames) {
    const rawValues = rows.map((r) => (r[colName] === undefined ? '' : String(r[colName]).trim()));
    const nonNullValues = rawValues.filter((v) => v !== '');
    const nullCount = rawValues.length - nonNullValues.length;

    const { type: dataType } = detectColumnType(nonNullValues);

    // Validity
    let invalidCount = 0;
    nonNullValues.forEach((v) => {
      if (!matchesType(v, dataType)) invalidCount += 1;
    });
    const validCount = nonNullValues.length - invalidCount;

    // Uniqueness
    const valueCounts = new Map();
    nonNullValues.forEach((v) => valueCounts.set(v, (valueCounts.get(v) || 0) + 1));
    const uniqueValues = valueCounts.size;
    let duplicateValueCount = 0;
    valueCounts.forEach((count) => {
      if (count > 1) duplicateValueCount += count - 1;
    });

    // Consistency (shape-signature dominant pattern check) - only meaningful
    // for STRING columns; numeric/date/boolean types are considered
    // consistent if they pass the validity check.
    let consistentCount;
    if (dataType === 'STRING') {
      const shapeCounts = new Map();
      nonNullValues.forEach((v) => {
        const sig = shapeSignature(v);
        shapeCounts.set(sig, (shapeCounts.get(sig) || 0) + 1);
      });
      let dominantShapeCount = 0;
      shapeCounts.forEach((count) => {
        if (count > dominantShapeCount) dominantShapeCount = count;
      });
      // If there's huge variety (e.g. free text/names), don't punish it -
      // only flag inconsistency when a clear dominant pattern exists but
      // some values deviate from it AND cardinality of shapes is low
      // relative to sample (i.e. looks like a structured field).
      const shapeVariety = shapeCounts.size;
      const looksStructured = shapeVariety <= Math.max(5, nonNullValues.length * 0.15);
      consistentCount = looksStructured ? dominantShapeCount : nonNullValues.length;
    } else {
      consistentCount = validCount;
    }

    // Min/Max/Avg where applicable
    let minValue = null;
    let maxValue = null;
    let avgValue = null;

    if (dataType === 'INTEGER' || dataType === 'DECIMAL') {
      const nums = nonNullValues
        .filter((v) => matchesType(v, dataType))
        .map((v) => parseFloat(v));
      if (nums.length) {
        minValue = String(Math.min(...nums));
        maxValue = String(Math.max(...nums));
        avgValue = round2(nums.reduce((a, b) => a + b, 0) / nums.length);
      }
    } else if (dataType === 'DATE') {
      const dates = nonNullValues
        .filter((v) => matchesType(v, dataType))
        .map((v) => new Date(v))
        .filter((d) => !Number.isNaN(d.getTime()));
      if (dates.length) {
        minValue = new Date(Math.min(...dates)).toISOString().slice(0, 10);
        maxValue = new Date(Math.max(...dates)).toISOString().slice(0, 10);
      }
    } else if (dataType === 'STRING') {
      const lengths = nonNullValues.map((v) => v.length);
      if (lengths.length) {
        minValue = String(Math.min(...lengths));
        maxValue = String(Math.max(...lengths));
      }
    }

    const nullPercentage = safePct(nullCount, rawValues.length);
    const uniquePercentage = safePct(uniqueValues, nonNullValues.length);
    const completenessCol = safePct(nonNullValues.length, rawValues.length);
    const validityCol = safePct(validCount, nonNullValues.length);
    const uniquenessCol = uniquePercentage;
    const consistencyCol = safePct(consistentCount, nonNullValues.length);

    const colScore = computeColumnScore({
      completeness: completenessCol,
      validity: validityCol,
      uniqueness: uniquenessCol,
      consistency: consistencyCol,
    });
    const status = columnQualityStatus(colScore);

    columns.push({
      columnName: colName,
      dataType,
      totalValues: rawValues.length,
      nonNullValues: nonNullValues.length,
      nullValues: nullCount,
      nullPercentage,
      uniqueValues,
      uniquePercentage,
      duplicateValues: duplicateValueCount,
      invalidValues: invalidCount,
      minValue,
      maxValue,
      avgValue,
      qualityScore: colScore,
      qualityStatus: status,
      _dims: { completenessCol, validityCol, uniquenessCol, consistencyCol },
    });

    datasetMissing += nullCount;
    datasetValid += validCount;
    datasetInvalid += invalidCount;

    // Issue generation
    if (nullCount > 0) {
      issues.push({
        columnName: colName,
        issueType: 'MISSING_VALUES',
        affectedRecords: nullCount,
        percentage: nullPercentage,
        severity: nullPercentage >= 20 ? 'HIGH' : nullPercentage >= 5 ? 'WARNING' : 'LOW',
        description: `${nullCount} missing value(s) found in column "${colName}" (${nullPercentage}%).`,
      });
    }
    if (invalidCount > 0) {
      const invalidPct = safePct(invalidCount, nonNullValues.length);
      issues.push({
        columnName: colName,
        issueType: 'INVALID_TYPE',
        affectedRecords: invalidCount,
        percentage: invalidPct,
        severity: invalidPct >= 20 ? 'HIGH' : invalidPct >= 5 ? 'WARNING' : 'LOW',
        description: `${invalidCount} value(s) in "${colName}" do not match the detected type (${dataType}).`,
      });
    }
    if (duplicateValueCount > 0) {
      const dupPct = safePct(duplicateValueCount, nonNullValues.length);
      issues.push({
        columnName: colName,
        issueType: 'DUPLICATE_VALUES',
        affectedRecords: duplicateValueCount,
        percentage: dupPct,
        severity: dupPct >= 20 ? 'HIGH' : dupPct >= 5 ? 'WARNING' : 'LOW',
        description: `${duplicateValueCount} duplicate value(s) found in column "${colName}".`,
      });
    }
    if (dataType === 'STRING' && consistentCount < nonNullValues.length) {
      const inconsistentCount = nonNullValues.length - consistentCount;
      const incPct = safePct(inconsistentCount, nonNullValues.length);
      if (incPct >= 5) {
        issues.push({
          columnName: colName,
          issueType: 'INCONSISTENT_FORMAT',
          affectedRecords: inconsistentCount,
          percentage: incPct,
          severity: incPct >= 20 ? 'HIGH' : 'WARNING',
          description: `${inconsistentCount} value(s) in "${colName}" deviate from the dominant format pattern.`,
        });
      }
    }
  }

  if (duplicateRows > 0) {
    issues.push({
      columnName: null,
      issueType: 'DUPLICATE_RECORDS',
      affectedRecords: duplicateRows,
      percentage: safePct(duplicateRows, totalRows),
      severity: safePct(duplicateRows, totalRows) >= 10 ? 'HIGH' : 'WARNING',
      description: `${duplicateRows} duplicate row(s) found in the dataset.`,
    });
  }

  // Dataset-level dimension scores = simple average across columns
  const avg = (key) =>
    columns.length
      ? round2(columns.reduce((sum, c) => sum + c._dims[key], 0) / columns.length)
      : 100;

  const completenessScore = avg('completenessCol');
  const validityScore = avg('validityCol');
  const uniquenessScore = avg('uniquenessCol');
  const consistencyScore = avg('consistencyCol');

  const qualityScore = computeDatasetScore({
    completeness: completenessScore,
    validity: validityScore,
    uniqueness: uniquenessScore,
    consistency: consistencyScore,
  });

  const datasetLevel = {
    totalRows,
    totalColumns,
    totalCells,
    missingValues: datasetMissing,
    duplicateRows,
    validValues: datasetValid,
    invalidValues: datasetInvalid,
    qualityScore,
    completenessScore,
    validityScore,
    uniquenessScore,
    consistencyScore,
  };

  // strip internal _dims before returning
  const cleanColumns = columns.map(({ _dims, ...rest }) => rest);

  return { datasetLevel, columns: cleanColumns, issues };
}

module.exports = { profileDataset, readDatasetRows };
