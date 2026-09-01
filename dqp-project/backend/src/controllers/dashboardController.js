const { Dataset, DatasetProfile, QualityIssue, ColumnProfile } = require('../models');
const { sequelize } = require('../models');

async function getDashboardData(req, res, next) {
  try {
    const datasets = await Dataset.findAll();
    const totalDatasets = datasets.length;
    const profiledDatasets = datasets.filter((d) => d.profileStatus === 'COMPLETED');

    const avgQualityScore = profiledDatasets.length
      ? Math.round(
          (profiledDatasets.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / profiledDatasets.length) * 100
        ) / 100
      : 0;

    const totalRows = datasets.reduce((sum, d) => sum + (d.rowCount || 0), 0);

    const allIssues = await QualityIssue.findAll();
    const issuesBySeverity = { LOW: 0, WARNING: 0, HIGH: 0 };
    allIssues.forEach((i) => {
      issuesBySeverity[i.severity] = (issuesBySeverity[i.severity] || 0) + 1;
    });

    const allColumns = await ColumnProfile.findAll();
    const typeDistribution = {};
    allColumns.forEach((c) => {
      typeDistribution[c.dataType] = (typeDistribution[c.dataType] || 0) + 1;
    });

    const recentProfiles = await DatasetProfile.findAll({
      order: [['profiledAt', 'DESC']],
      limit: 5,
      include: [{ model: Dataset, attributes: ['id', 'name'] }],
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalDatasets,
          profiledDatasets: profiledDatasets.length,
          totalRows,
          totalIssues: allIssues.length,
          avgQualityScore,
        },
        issuesBySeverity,
        typeDistribution,
        recentProfiles,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardData };
