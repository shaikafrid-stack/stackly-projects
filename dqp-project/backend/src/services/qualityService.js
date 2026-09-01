/**
 * Evaluates the four core quality checks (Completeness, Uniqueness,
 * Validity, Consistency) plus Duplicate Records against configured
 * quality_rules thresholds (falls back to sensible defaults if no
 * active rule of that type exists), returning a PASSED / WARNING / FAILED
 * verdict for each.
 */

const DEFAULT_THRESHOLDS = {
  COMPLETENESS: 90,
  UNIQUENESS: 85,
  VALIDITY: 90,
  CONSISTENCY: 80,
};

function verdictFor(score, threshold) {
  if (score >= threshold) return 'PASSED';
  if (score >= threshold - 15) return 'WARNING';
  return 'FAILED';
}

function evaluateChecks(datasetProfile, activeRules = []) {
  const thresholds = { ...DEFAULT_THRESHOLDS };
  activeRules
    .filter((r) => r.status === 'ACTIVE')
    .forEach((r) => {
      thresholds[r.ruleType] = r.threshold;
    });

  const checks = [
    {
      name: 'Completeness',
      description: 'Identifies missing or null values across the dataset.',
      score: datasetProfile.completenessScore,
      threshold: thresholds.COMPLETENESS,
      verdict: verdictFor(datasetProfile.completenessScore, thresholds.COMPLETENESS),
    },
    {
      name: 'Uniqueness',
      description: 'Identifies duplicate values within columns.',
      score: datasetProfile.uniquenessScore,
      threshold: thresholds.UNIQUENESS,
      verdict: verdictFor(datasetProfile.uniquenessScore, thresholds.UNIQUENESS),
    },
    {
      name: 'Validity',
      description: 'Identifies values that do not match the detected data type.',
      score: datasetProfile.validityScore,
      threshold: thresholds.VALIDITY,
      verdict: verdictFor(datasetProfile.validityScore, thresholds.VALIDITY),
    },
    {
      name: 'Consistency',
      description: 'Identifies inconsistent formats within columns.',
      score: datasetProfile.consistencyScore,
      threshold: thresholds.CONSISTENCY,
      verdict: verdictFor(datasetProfile.consistencyScore, thresholds.CONSISTENCY),
    },
    {
      name: 'Duplicate Records',
      description: 'Identifies duplicate rows within the dataset.',
      score: datasetProfile.totalRows
        ? Math.round(((datasetProfile.totalRows - datasetProfile.duplicateRows) / datasetProfile.totalRows) * 10000) / 100
        : 100,
      threshold: 95,
      verdict:
        datasetProfile.duplicateRows === 0
          ? 'PASSED'
          : datasetProfile.duplicateRows / (datasetProfile.totalRows || 1) <= 0.05
          ? 'WARNING'
          : 'FAILED',
    },
  ];

  return checks;
}

module.exports = { evaluateChecks, DEFAULT_THRESHOLDS };
