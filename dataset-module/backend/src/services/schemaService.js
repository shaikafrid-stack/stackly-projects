/**
 * Detects a basic schema (column name + inferred data type) from sample rows.
 * Type precedence: BOOLEAN > INTEGER > DECIMAL > DATE > STRING
 * A column is inferred as a type only if the vast majority (>=90%) of
 * non-empty values match that type; otherwise it falls back to STRING.
 */

const BOOLEAN_VALUES = new Set(['true', 'false', 'yes', 'no', '0', '1']);

function isInteger(v) {
  return /^-?\d+$/.test(v);
}
function isDecimal(v) {
  return /^-?\d+(\.\d+)?$/.test(v);
}
function isDate(v) {
  if (!v) return false;
  const d = new Date(v);
  return !isNaN(d.getTime()) && /\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(v);
}
function isBoolean(v) {
  return BOOLEAN_VALUES.has(String(v).toLowerCase());
}

function detectColumnType(values) {
  const nonEmpty = values.filter((v) => v !== undefined && v !== null && String(v).trim() !== '');
  if (nonEmpty.length === 0) return { type: 'STRING', nullable: true };

  const counts = { BOOLEAN: 0, INTEGER: 0, DECIMAL: 0, DATE: 0 };
  nonEmpty.forEach((raw) => {
    const v = String(raw).trim();
    if (isBoolean(v)) counts.BOOLEAN++;
    if (isInteger(v)) counts.INTEGER++;
    if (isDecimal(v)) counts.DECIMAL++;
    if (isDate(v)) counts.DATE++;
  });

  const threshold = nonEmpty.length * 0.9;
  let type = 'STRING';
  if (counts.BOOLEAN >= threshold) type = 'BOOLEAN';
  else if (counts.INTEGER >= threshold) type = 'INTEGER';
  else if (counts.DECIMAL >= threshold) type = 'DECIMAL';
  else if (counts.DATE >= threshold) type = 'DATE';

  const nullable = nonEmpty.length < values.length;
  return { type, nullable };
}

function detectSchema(headers, rows) {
  return headers.map((header, index) => {
    const values = rows.map((r) => r[header]);
    const { type, nullable } = detectColumnType(values);
    return { column_name: header, data_type: type, nullable, column_order: index };
  });
}

module.exports = { detectSchema, isInteger, isDecimal, isDate, isBoolean };
