const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QualityIssue = sequelize.define('QualityIssue', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  datasetId: { type: DataTypes.INTEGER, allowNull: false },
  columnName: { type: DataTypes.STRING(160), allowNull: true },
  issueType: { type: DataTypes.STRING(60), allowNull: false },
  affectedRecords: { type: DataTypes.INTEGER, defaultValue: 0 },
  percentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  severity: { type: DataTypes.ENUM('LOW', 'WARNING', 'HIGH'), defaultValue: 'WARNING' },
  description: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'quality_issues',
});

module.exports = QualityIssue;
