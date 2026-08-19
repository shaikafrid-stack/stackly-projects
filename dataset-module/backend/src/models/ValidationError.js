const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ValidationError extends Model {}

ValidationError.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  validation_id: { type: DataTypes.INTEGER, allowNull: false },
  row_number: { type: DataTypes.INTEGER, allowNull: false },
  column_name: { type: DataTypes.STRING(200) },
  invalid_value: { type: DataTypes.STRING(500) },
  error_message: { type: DataTypes.STRING(500), allowNull: false }
}, {
  sequelize,
  modelName: 'ValidationError',
  tableName: 'validation_errors'
});

module.exports = ValidationError;
