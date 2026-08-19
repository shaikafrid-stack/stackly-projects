const { isInteger, isDecimal, isDate } = require('./schemaService');

/**
 * Validates headers: existence, emptiness, duplicates.
 */
function validateHeaders(headers) {
  const errors = [];
  if (!headers || headers.length === 0) {
    errors.push({ row_number: 0, column_name: null, invalid_value: null, error_message: 'No headers found in file' });
    return errors;
  }
  const seen = new Map();
  headers.forEach((h) => {
    const trimmed = (h || '').trim();
    if (trimmed === '') {
      errors.push({ row_number: 0, column_name: h, invalid_value: h, error_message: 'Empty header name' });
    }
    seen.set(trimmed, (seen.get(trimmed) || 0) + 1);
  });
  seen.forEach((count, name) => {
    if (count > 1 && name !== '') {
      errors.push({ row_number: 0, column_name: name, invalid_value: name, error_message: 'Duplicate header name' });
    }
  });
  return errors;
}

/**
 * Validates each row against the detected schema.
 * Checks: missing values, invalid numeric values, invalid dates.
 * Also tracks duplicate rows (by full-row content) and missing-value count.
 */
function validateRows(headers, rows, schema) {
  const typeByColumn = {};
  schema.forEach((c) => { typeByColumn[c.column_name] = c.data_type; });

  const rowErrors = [];
  let missingValues = 0;
  let invalidRowNumbers = new Set();
  const seenRows = new Map();
  let duplicateCount = 0;

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1; // 1-indexed, matches "row in file" for user-facing display
    const rowKey = JSON.stringify(row);
    seenRows.set(rowKey, (seenRows.get(rowKey) || 0) + 1);

    headers.forEach((col) => {
      const rawValue = row[col];
      const value = rawValue === undefined || rawValue === null ? '' : String(rawValue).trim();
      const type = typeByColumn[col];

      if (value === '') {
        missingValues++;
        return;
      }

      if (type === 'INTEGER' && !isInteger(value)) {
        rowErrors.push({ row_number: rowNumber, column_name: col, invalid_value: value, error_message: 'Invalid numeric value' });
        invalidRowNumbers.add(rowNumber);
      } else if (type === 'DECIMAL' && !isDecimal(value)) {
        rowErrors.push({ row_number: rowNumber, column_name: col, invalid_value: value, error_message: 'Invalid numeric value' });
        invalidRowNumbers.add(rowNumber);
      } else if (type === 'DATE' && !isDate(value)) {
        rowErrors.push({ row_number: rowNumber, column_name: col, invalid_value: value, error_message: 'Invalid date' });
        invalidRowNumbers.add(rowNumber);
      }
    });
  });

  seenRows.forEach((count) => {
    if (count > 1) duplicateCount += count - 1;
  });

  return {
    rowErrors,
    missingValues,
    duplicateCount,
    invalidRecordCount: invalidRowNumbers.size
  };
}

/**
 * Runs the full validation pipeline and returns a summary + detailed errors,
 * ready to be persisted via ValidationResult / ValidationError models.
 */
function runValidation(headers, rows, schema) {
  const headerErrors = validateHeaders(headers);
  const { rowErrors, missingValues, duplicateCount, invalidRecordCount } = validateRows(headers, rows, schema);

  const allErrors = [...headerErrors, ...rowErrors];
  const totalRecords = rows.length;
  const invalidRecords = invalidRecordCount + (headerErrors.length > 0 ? 0 : 0); // header errors don't count against row totals
  const validRecords = Math.max(totalRecords - invalidRecords, 0);

  const validationStatus = (headerErrors.length > 0 || invalidRecords > 0) ? 'FAILED' : 'PASSED';

  return {
    summary: {
      total_records: totalRecords,
      valid_records: validRecords,
      invalid_records: invalidRecords,
      missing_values: missingValues,
      duplicate_records: duplicateCount,
      validation_status: validationStatus
    },
    errors: allErrors
  };
}

module.exports = { validateHeaders, validateRows, runValidation };
