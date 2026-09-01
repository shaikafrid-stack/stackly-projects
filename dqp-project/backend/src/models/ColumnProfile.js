const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ColumnProfile = sequelize.define('ColumnProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profileId: { type: DataTypes.INTEGER, allowNull: false },
  datasetId: { type: DataTypes.INTEGER, allowNull: false },
  columnName: { type: DataTypes.STRING(160), allowNull: false },
  dataType: { type: DataTypes.STRING(30), allowNull: false },
  totalValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  nonNullValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  nullValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  nullPercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  uniqueValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  uniquePercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  duplicateValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  invalidValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  minValue: { type: DataTypes.STRING(100), allowNull: true },
  maxValue: { type: DataTypes.STRING(100), allowNull: true },
  avgValue: { type: DataTypes.FLOAT, allowNull: true },
  qualityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  qualityStatus: { type: DataTypes.STRING(20), defaultValue: 'GOOD' },
}, {
  tableName: 'column_profiles',
});

module.exports = ColumnProfile;
