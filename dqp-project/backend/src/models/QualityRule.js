const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QualityRule = sequelize.define('QualityRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruleName: { type: DataTypes.STRING(160), allowNull: false },
  ruleType: {
    type: DataTypes.ENUM('COMPLETENESS', 'UNIQUENESS', 'VALIDITY', 'CONSISTENCY'),
    allowNull: false,
  },
  threshold: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 90 },
  severity: { type: DataTypes.ENUM('LOW', 'WARNING', 'HIGH'), defaultValue: 'WARNING' },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'quality_rules',
});

module.exports = QualityRule;
