/**
 * Data Quality Scoring Service
 * ------------------------------------------------------------------
 * Dimension formulas (all expressed as percentages 0-100):
 *
 * COMPLETENESS = (non_null_cells / total_cells) * 100
 *   -> measures how much of the dataset is populated (no missing values).
 *
 * VALIDITY     = (valid_values / total_non_null_values) * 100
 *   -> measures how many populated values actually conform to the
 *      detected data type for their column (e.g. an INTEGER column
 *      containing "abc" counts as invalid).
 *
 * UNIQUENESS   = (unique_non_null_values / total_non_null_values) * 100
 *   -> averaged across all columns. Measures how free of duplicate
 *      values each column is. (Row-level duplicate detection is
 *      reported separately as "duplicate rows".)
 *
 * CONSISTENCY  = (consistent_values / total_non_null_values) * 100
 *   -> measures formatting consistency within a column (e.g. mixed
 *      date formats, mixed casing patterns for categorical/string
 *      columns). Implemented via a per-column dominant-pattern check:
 *      the most common "shape" of the value (regex-based signature)
 *      must be shared by a value for it to count as consistent.
 *
 * OVERALL DATASET QUALITY SCORE (weighted average):
 *   OVERALL = (COMPLETENESS * 0.35) + (VALIDITY * 0.30)
 *           + (UNIQUENESS   * 0.20) + (CONSISTENCY * 0.15)
 *
 * Weights reflect that missing data (completeness) and wrong-type data
 * (validity) are typically the most damaging issues for downstream
 * analytics, followed by uniqueness/duplication, then formatting
 * consistency.
 *
 * COLUMN-LEVEL QUALITY SCORE (per column):
 *   COLUMN_SCORE = (col_completeness * 0.4) + (col_validity * 0.3)
 *                + (col_uniqueness   * 0.2) + (col_consistency * 0.1)
 *
 * Column-level STATUS thresholds:
 *   GOOD    : score >= 85
 *   WARNING : 60 <= score < 85
 *   POOR    : score < 60
 * ------------------------------------------------------------------
 */

const DATASET_WEIGHTS = {
  completeness: 0.35,
  validity: 0.3,
  uniqueness: 0.2,
  consistency: 0.15,
};

const COLUMN_WEIGHTS = {
  completeness: 0.4,
  validity: 0.3,
  uniqueness: 0.2,
  consistency: 0.1,
};

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function safePct(numerator, denominator) {
  if (!denominator || denominator <= 0) return 100; // no data => nothing to penalize
  return round2((numerator / denominator) * 100);
}

function columnQualityStatus(score) {
  if (score >= 85) return 'GOOD';
  if (score >= 60) return 'WARNING';
  return 'POOR';
}

function computeColumnScore({ completeness, validity, uniqueness, consistency }) {
  const score =
    completeness * COLUMN_WEIGHTS.completeness +
    validity * COLUMN_WEIGHTS.validity +
    uniqueness * COLUMN_WEIGHTS.uniqueness +
    consistency * COLUMN_WEIGHTS.consistency;
  return round2(score);
}

function computeDatasetScore({ completeness, validity, uniqueness, consistency }) {
  const score =
    completeness * DATASET_WEIGHTS.completeness +
    validity * DATASET_WEIGHTS.validity +
    uniqueness * DATASET_WEIGHTS.uniqueness +
    consistency * DATASET_WEIGHTS.consistency;
  return round2(score);
}

module.exports = {
  DATASET_WEIGHTS,
  COLUMN_WEIGHTS,
  round2,
  safePct,
  columnQualityStatus,
  computeColumnScore,
  computeDatasetScore,
};
