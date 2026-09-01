/**
 * Detects the most likely data type for a column based on a sample of its values.
 * Supported types: INTEGER, DECIMAL, BOOLEAN, DATE, STRING
 */

const BOOLEAN_VALUES = new Set(['true', 'false', 'yes', 'no', '1', '0', 'y', 'n']);
const DATE_REGEXES = [
  /^\d{4}-\d{2}-\d{2}$/,                 // 2024-01-31
  /^\d{2}\/\d{2}\/\d{4}$/,               // 01/31/2024
  /^\d{2}-\d{2}-\d{4}$/,                 // 31-01-2024
  /^\d{4}\/\d{2}\/\d{2}$/,               // 2024/01/31
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ // ISO datetime
];

function isInteger(v) {
  return /^-?\d+$/.test(v);
}

function isDecimal(v) {
  return /^-?\d+\.\d+$/.test(v) || (/^-?\d+(\.\d+)?e[-+]?\d+$/i.test(v));
}

function isBoolean(v) {
  return BOOLEAN_VALUES.has(v.toLowerCase());
}

function isDate(v) {
  if (DATE_REGEXES.some((re) => re.test(v))) return true;
  // fallback: parseable and reasonably looks like a date (avoid classifying plain numbers)
  if (/^\d+$/.test(v)) return false;
  const parsed = Date.parse(v);
  return !Number.isNaN(parsed) && /[a-zA-Z]/.test(v) === false ? false : !Number.isNaN(parsed);
}

/**
 * Classifies a single raw string value into one of the supported types.
 */
function classifyValue(raw) {
  const v = String(raw).trim();
  if (v === '') return null;
  if (isInteger(v)) return 'INTEGER';
  if (isDecimal(v)) return 'DECIMAL';
  if (isBoolean(v)) return 'BOOLEAN';
  if (isDate(v)) return 'DATE';
  return 'STRING';
}

/**
 * Given all non-null values for a column, determine the dominant/detected type
 * using majority vote (>= 80% of values agree), otherwise fallback to STRING.
 */
function detectColumnType(values) {
  const counts = { INTEGER: 0, DECIMAL: 0, BOOLEAN: 0, DATE: 0, STRING: 0 };
  let total = 0;

  for (const raw of values) {
    const v = String(raw).trim();
    if (v === '') continue;
    total += 1;
    const type = classifyValue(v);
    if (type) counts[type] += 1;
  }

  if (total === 0) return { type: 'STRING', confidence: 0 };

  // Numbers that are integers are also valid decimals conceptually, so if
  // decimal detection is strong, prefer DECIMAL, else INTEGER, else others.
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topType, topCount] = ranked[0];
  const confidence = topCount / total;

  // Require 80% agreement to commit to a non-string type
  if (topType !== 'STRING' && confidence >= 0.8) {
    return { type: topType, confidence };
  }
  return { type: 'STRING', confidence: total > 0 ? counts.STRING / total : 0 };
}

/**
 * Checks whether a single value matches an already-detected column type.
 * Used for validity checks.
 */
function matchesType(raw, type) {
  const v = String(raw).trim();
  if (v === '') return true; // nulls are handled separately as completeness issues
  switch (type) {
    case 'INTEGER':
      return isInteger(v);
    case 'DECIMAL':
      return isInteger(v) || isDecimal(v);
    case 'BOOLEAN':
      return isBoolean(v);
    case 'DATE':
      return isDate(v);
    case 'STRING':
    default:
      return true;
  }
}

module.exports = { detectColumnType, matchesType, classifyValue };
