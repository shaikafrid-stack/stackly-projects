const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DatasetProfile = sequelize.define('DatasetProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  datasetId: { type: DataTypes.INTEGER, allowNull: false },
  totalRows: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalColumns: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalCells: { type: DataTypes.INTEGER, defaultValue: 0 },
  missingValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  duplicateRows: { type: DataTypes.INTEGER, defaultValue: 0 },
  validValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  invalidValues: { type: DataTypes.INTEGER, defaultValue: 0 },
  qualityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  completenessScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  validityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  uniquenessScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  consistencyScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  profiledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'dataset_profiles',
});

module.exports = DatasetProfile;
