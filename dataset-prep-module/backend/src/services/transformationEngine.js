/**
 * Transformation Engine
 * ----------------------
 * Pure functions that apply a single transformation step to an in-memory
 * dataset representation: { columns: [{name, dataType}], rows: [{...}] }
 *
 * Every apply* function returns { columns, rows, recordsAffected, log }
 * so the caller can build a transformation_history entry and a diff summary.
 */

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function coerceType(value, dataType) {
  if (value === null || value === undefined || value === '') return null;
  switch (dataType) {
    case 'Integer': {
      const n = parseInt(value, 10);
      return Number.isNaN(n) ? null : n;
    }
    case 'Decimal': {
      const n = parseFloat(value);
      return Number.isNaN(n) ? null : n;
    }
    case 'Boolean': {
      if (typeof value === 'boolean') return value;
      const s = String(value).trim().toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(s)) return true;
      if (['false', '0', 'no', 'n'].includes(s)) return false;
      return null;
    }
    case 'Date': {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    }
    case 'String':
    default:
      return String(value);
  }
}

function applyRenameColumn(data, config) {
  const { column, newName } = config;
  if (!newName || newName === column) return { ...data, recordsAffected: 0, log: 'No change (same name).' };
  const columns = data.columns.map((c) => (c.name === column ? { ...c, name: newName } : c));
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    if (Object.prototype.hasOwnProperty.call(newRow, column)) {
      newRow[newName] = newRow[column];
      delete newRow[column];
    }
    return newRow;
  });
  return { columns, rows, recordsAffected: rows.length, log: `Renamed "${column}" -> "${newName}"` };
}

function applyRemoveColumn(data, config) {
  const { column } = config;
  const columns = data.columns.filter((c) => c.name !== column);
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    delete newRow[column];
    return newRow;
  });
  return { columns, rows, recordsAffected: rows.length, log: `Removed column "${column}"` };
}

function applyChangeDataType(data, config) {
  const { column, newType } = config;
  const columns = data.columns.map((c) => (c.name === column ? { ...c, dataType: newType } : c));
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    const coerced = coerceType(r[column], newType);
    if (coerced !== r[column]) affected += 1;
    newRow[column] = coerced;
    return newRow;
  });
  return { columns, rows, recordsAffected: affected, log: `Converted "${column}" to ${newType}` };
}

function applyRemoveNullRows(data, config) {
  const { column } = config; // optional: if omitted, applies to any column
  const before = data.rows.length;
  const rows = data.rows.filter((r) => {
    if (column) return !(r[column] === null || r[column] === undefined || r[column] === '');
    return !Object.values(r).some((v) => v === null || v === undefined || v === '');
  });
  return { columns: data.columns, rows, recordsAffected: before - rows.length, log: `Removed ${before - rows.length} row(s) with null values${column ? ` in "${column}"` : ''}` };
}

function applyReplaceNulls(data, config) {
  const { column, value } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    if (newRow[column] === null || newRow[column] === undefined || newRow[column] === '') {
      newRow[column] = value;
      affected += 1;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Replaced ${affected} null value(s) in "${column}" with "${value}"` };
}

function applyTrim(data, config) {
  const { column } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    if (typeof newRow[column] === 'string') {
      const trimmed = newRow[column].trim();
      if (trimmed !== newRow[column]) affected += 1;
      newRow[column] = trimmed;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Trimmed whitespace in "${column}"` };
}

function applyCase(data, config, mode) {
  const { column } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    if (typeof newRow[column] === 'string') {
      const transformed = mode === 'upper' ? newRow[column].toUpperCase() : newRow[column].toLowerCase();
      if (transformed !== newRow[column]) affected += 1;
      newRow[column] = transformed;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Converted "${column}" to ${mode}case` };
}

function applyRoundDecimal(data, config) {
  const { column, precision = 2 } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    const num = parseFloat(newRow[column]);
    if (!Number.isNaN(num)) {
      const rounded = parseFloat(num.toFixed(precision));
      if (rounded !== newRow[column]) affected += 1;
      newRow[column] = rounded;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Rounded "${column}" to ${precision} decimal place(s)` };
}

function applyAddNumeric(data, config) {
  const { column, amount } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    const num = parseFloat(newRow[column]);
    if (!Number.isNaN(num)) {
      newRow[column] = num + parseFloat(amount);
      affected += 1;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Added ${amount} to "${column}"` };
}

function applyMultiplyNumeric(data, config) {
  const { column, factor } = config;
  let affected = 0;
  const rows = data.rows.map((r) => {
    const newRow = { ...r };
    const num = parseFloat(newRow[column]);
    if (!Number.isNaN(num)) {
      newRow[column] = num * parseFloat(factor);
      affected += 1;
    }
    return newRow;
  });
  return { columns: data.columns, rows, recordsAffected: affected, log: `Multiplied "${column}" by ${factor}` };
}

function applyRemoveDuplicates(data) {
  const before = data.rows.length;
  const seen = new Set();
  const rows = data.rows.filter((r) => {
    const key = JSON.stringify(r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { columns: data.columns, rows, recordsAffected: before - rows.length, log: `Removed ${before - rows.length} duplicate row(s)` };
}

const OPERATORS = {
  equals: (a, b) => String(a) === String(b),
  not_equals: (a, b) => String(a) !== String(b),
  greater_than: (a, b) => parseFloat(a) > parseFloat(b),
  less_than: (a, b) => parseFloat(a) < parseFloat(b),
  contains: (a, b) => String(a ?? '').toLowerCase().includes(String(b).toLowerCase()),
  is_null: (a) => a === null || a === undefined || a === ''
};

function applyFilterRows(data, config) {
  const { column, operator, value } = config;
  const before = data.rows.length;
  const opFn = OPERATORS[operator] || OPERATORS.equals;
  const rows = data.rows.filter((r) => opFn(r[column], value));
  return { columns: data.columns, rows, recordsAffected: before - rows.length, log: `Filtered rows where "${column}" ${operator} "${value}" (kept ${rows.length}/${before})` };
}

const TRANSFORM_HANDLERS = {
  RENAME_COLUMN: applyRenameColumn,
  REMOVE_COLUMN: applyRemoveColumn,
  CHANGE_DATA_TYPE: applyChangeDataType,
  REMOVE_NULL_ROWS: applyRemoveNullRows,
  REPLACE_NULLS: applyReplaceNulls,
  TRIM_WHITESPACE: applyTrim,
  TO_UPPERCASE: (d, c) => applyCase(d, c, 'upper'),
  TO_LOWERCASE: (d, c) => applyCase(d, c, 'lower'),
  ROUND_DECIMAL: applyRoundDecimal,
  ADD_NUMERIC: applyAddNumeric,
  MULTIPLY_NUMERIC: applyMultiplyNumeric,
  REMOVE_DUPLICATES: applyRemoveDuplicates,
  FILTER_ROWS: applyFilterRows
};

const TRANSFORM_LABELS = {
  RENAME_COLUMN: 'Rename Column',
  REMOVE_COLUMN: 'Remove Column',
  CHANGE_DATA_TYPE: 'Change Data Type',
  REMOVE_NULL_ROWS: 'Remove Null Rows',
  REPLACE_NULLS: 'Replace Null Values',
  TRIM_WHITESPACE: 'Trim Whitespace',
  TO_UPPERCASE: 'Convert to Uppercase',
  TO_LOWERCASE: 'Convert to Lowercase',
  ROUND_DECIMAL: 'Round Decimal Values',
  ADD_NUMERIC: 'Add Numeric Value',
  MULTIPLY_NUMERIC: 'Multiply Numeric Value',
  REMOVE_DUPLICATES: 'Remove Duplicate Rows',
  FILTER_ROWS: 'Filter Rows'
};

/**
 * Apply an ordered list of transformation steps to the source data.
 * steps: [{ transformation_type, configuration }]
 * Returns { result, stepResults } where stepResults mirrors each step's effect (for history/preview).
 */
function runPipeline(sourceData, steps) {
  let current = cloneData(sourceData);
  const stepResults = [];

  for (const step of steps) {
    const handler = TRANSFORM_HANDLERS[step.transformation_type];
    if (!handler) {
      stepResults.push({
        transformation_type: step.transformation_type,
        status: 'FAILED',
        recordsAffected: 0,
        log: `Unknown transformation type: ${step.transformation_type}`
      });
      continue; // skip unknown op, keep pipeline going
    }
    try {
      const config = typeof step.configuration === 'string' ? JSON.parse(step.configuration) : (step.configuration || {});
      const { columns, rows, recordsAffected, log } = handler(current, config);
      current = { columns, rows };
      stepResults.push({
        transformation_type: step.transformation_type,
        label: TRANSFORM_LABELS[step.transformation_type] || step.transformation_type,
        status: 'SUCCESS',
        recordsAffected,
        log
      });
    } catch (err) {
      stepResults.push({
        transformation_type: step.transformation_type,
        label: TRANSFORM_LABELS[step.transformation_type] || step.transformation_type,
        status: 'FAILED',
        recordsAffected: 0,
        log: `Failed: ${err.message}`
      });
      // Halt on failure - a failed step mid-pipeline stops further execution,
      // preserving the last successfully transformed state (see README write-up).
      break;
    }
  }

  return { result: current, stepResults };
}

/**
 * Run basic validation against a dataset snapshot.
 */
function runValidation(data, requiredColumns = []) {
  const totalRecords = data.rows.length;
  const columnNames = data.columns.map((c) => c.name);
  let nullValues = 0;
  let invalidRecords = 0;
  const seen = new Set();
  let duplicateRecords = 0;
  const missingRequired = requiredColumns.filter((rc) => !columnNames.includes(rc));

  data.rows.forEach((row) => {
    let rowInvalid = false;
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicateRecords += 1;
    } else {
      seen.add(key);
    }
    Object.entries(row).forEach(([col, val]) => {
      if (val === null || val === undefined || val === '') {
        nullValues += 1;
        rowInvalid = true;
      }
    });
    if (missingRequired.length > 0) rowInvalid = true;
    if (rowInvalid) invalidRecords += 1;
  });

  const validRecords = totalRecords - invalidRecords;

  let status = 'PASSED';
  if (missingRequired.length > 0 || (totalRecords > 0 && invalidRecords / totalRecords > 0.4)) {
    status = 'FAILED';
  } else if (nullValues > 0 || duplicateRecords > 0) {
    status = 'WARNING';
  }

  return {
    totalRecords,
    validRecords,
    invalidRecords,
    nullValues,
    duplicateRecords,
    missingRequired,
    status
  };
}

module.exports = {
  TRANSFORM_HANDLERS,
  TRANSFORM_LABELS,
  runPipeline,
  runValidation,
  cloneData
};
