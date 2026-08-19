const sequelize = require('../config/db');
const User = require('./User');
const Dataset = require('./Dataset');
const DatasetColumn = require('./DatasetColumn');
const ValidationResult = require('./ValidationResult');
const ValidationError = require('./ValidationError');

// Associations
User.hasMany(Dataset, { foreignKey: 'uploaded_by', as: 'datasets' });
Dataset.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

Dataset.hasMany(DatasetColumn, { foreignKey: 'dataset_id', as: 'columns', onDelete: 'CASCADE' });
DatasetColumn.belongsTo(Dataset, { foreignKey: 'dataset_id' });

Dataset.hasMany(ValidationResult, { foreignKey: 'dataset_id', as: 'validationResults', onDelete: 'CASCADE' });
ValidationResult.belongsTo(Dataset, { foreignKey: 'dataset_id' });

ValidationResult.hasMany(ValidationError, { foreignKey: 'validation_id', as: 'errors', onDelete: 'CASCADE' });
ValidationError.belongsTo(ValidationResult, { foreignKey: 'validation_id' });

module.exports = {
  sequelize,
  User,
  Dataset,
  DatasetColumn,
  ValidationResult,
  ValidationError
};
