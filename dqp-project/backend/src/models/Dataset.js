const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dataset = sequelize.define('Dataset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  fileName: { type: DataTypes.STRING(255), allowNull: false },
  filePath: { type: DataTypes.STRING(500), allowNull: false },
  fileType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'CSV' },
  rowCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  columnCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'),
    defaultValue: 'PROCESSED',
  },
  profileStatus: {
    type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'),
    defaultValue: 'NOT_STARTED',
  },
  qualityScore: { type: DataTypes.FLOAT, allowNull: true },
  lastProfiledAt: { type: DataTypes.DATE, allowNull: true },
  uploadedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'datasets',
});

module.exports = Dataset;
