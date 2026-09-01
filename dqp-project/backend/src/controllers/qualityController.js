const { Op } = require('sequelize');
const { Dataset, DatasetProfile, QualityIssue, QualityRule } = require('../models');
const { evaluateChecks } = require('../services/qualityService');

async function getQualityResults(req, res, next) {
  try {
    const dataset = await Dataset.findByPk(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    const profile = await DatasetProfile.findOne({
      where: { datasetId: dataset.id },
      order: [['profiledAt', 'DESC']],
    });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'No profiling results found. Please run profiling first.' });
    }
    const activeRules = await QualityRule.findAll({ where: { status: 'ACTIVE' } });
    const checks = evaluateChecks(profile, activeRules);

    res.json({
      success: true,
      data: {
        overallScore: profile.qualityScore,
        dimensions: {
          completeness: profile.completenessScore,
          validity: profile.validityScore,
          uniqueness: profile.uniquenessScore,
          consistency: profile.consistencyScore,
        },
        checks,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getQualityIssues(req, res, next) {
  try {
    const dataset = await Dataset.findByPk(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    const { issueType, severity, column, page = 1, limit = 20 } = req.query;
    const where = { datasetId: dataset.id };
    if (issueType) where.issueType = issueType;
    if (severity) where.severity = severity;
    if (column) where.columnName = { [Op.like]: `%${column}%` };

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await QualityIssue.findAndCountAll({
      where,
      order: [['severity', 'DESC'], ['affectedRecords', 'DESC']],
      offset,
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQualityResults, getQualityIssues };
