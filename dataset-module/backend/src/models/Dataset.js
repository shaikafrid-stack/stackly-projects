const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Dataset extends Model {}

Dataset.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING(100) },
  tags: { type: DataTypes.STRING(255) },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  original_file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_type: { type: DataTypes.ENUM('CSV', 'XLSX'), allowNull: false },
  file_size: { type: DataTypes.BIGINT, allowNull: false },
  storage_path: { type: DataTypes.STRING(500), allowNull: false },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
  row_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  column_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('UPLOADED', 'VALIDATING', 'VALIDATION_FAILED', 'VALIDATED', 'PROCESSING', 'PROCESSED', 'FAILED'),
    allowNull: false,
    defaultValue: 'UPLOADED'
  },
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  processed_at: { type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: 'Dataset',
  tableName: 'datasets'
});

module.exports = Dataset;
