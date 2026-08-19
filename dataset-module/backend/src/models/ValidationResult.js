const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ValidationResult extends Model {}

ValidationResult.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dataset_id: { type: DataTypes.INTEGER, allowNull: false },
  total_records: { type: DataTypes.INTEGER, defaultValue: 0 },
  valid_records: { type: DataTypes.INTEGER, defaultValue: 0 },
  invalid_records: { type: DataTypes.INTEGER, defaultValue: 0 },
  missing_values: { type: DataTypes.INTEGER, defaultValue: 0 },
  duplicate_records: { type: DataTypes.INTEGER, defaultValue: 0 },
  validation_status: { type: DataTypes.ENUM('PASSED', 'FAILED'), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'ValidationResult',
  tableName: 'validation_results'
});

module.exports = ValidationResult;
