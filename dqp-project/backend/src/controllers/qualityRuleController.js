const { QualityRule } = require('../models');

async function listRules(req, res, next) {
  try {
    const rules = await QualityRule.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

async function createRule(req, res, next) {
  try {
    const { ruleName, ruleType, threshold, severity, status } = req.body;
    if (!ruleName || !ruleType || threshold === undefined) {
      return res.status(400).json({ success: false, message: 'ruleName, ruleType, threshold are required' });
    }
    const rule = await QualityRule.create({
      ruleName,
      ruleType,
      threshold,
      severity: severity || 'WARNING',
      status: status || 'ACTIVE',
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
}

async function updateRule(req, res, next) {
  try {
    const rule = await QualityRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Quality rule not found' });
    }
    const { ruleName, ruleType, threshold, severity, status } = req.body;
    if (ruleName !== undefined) rule.ruleName = ruleName;
    if (ruleType !== undefined) rule.ruleType = ruleType;
    if (threshold !== undefined) rule.threshold = threshold;
    if (severity !== undefined) rule.severity = severity;
    if (status !== undefined) rule.status = status;
    await rule.save();
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
}

async function deleteRule(req, res, next) {
  try {
    const rule = await QualityRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Quality rule not found' });
    }
    await rule.destroy();
    res.json({ success: true, message: 'Rule deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listRules, createRule, updateRule, deleteRule };
