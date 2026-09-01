const sequelize = require('../config/db');
const User = require('./User');
const Dataset = require('./Dataset');
const DatasetProfile = require('./DatasetProfile');
const ColumnProfile = require('./ColumnProfile');
const QualityIssue = require('./QualityIssue');
const QualityRule = require('./QualityRule');

// Relationships
Dataset.hasMany(DatasetProfile, { foreignKey: 'datasetId', as: 'profiles', onDelete: 'CASCADE' });
DatasetProfile.belongsTo(Dataset, { foreignKey: 'datasetId' });

DatasetProfile.hasMany(ColumnProfile, { foreignKey: 'profileId', as: 'columns', onDelete: 'CASCADE' });
ColumnProfile.belongsTo(DatasetProfile, { foreignKey: 'profileId' });

Dataset.hasMany(ColumnProfile, { foreignKey: 'datasetId', onDelete: 'CASCADE' });
ColumnProfile.belongsTo(Dataset, { foreignKey: 'datasetId' });

Dataset.hasMany(QualityIssue, { foreignKey: 'datasetId', as: 'issues', onDelete: 'CASCADE' });
QualityIssue.belongsTo(Dataset, { foreignKey: 'datasetId' });

User.hasMany(Dataset, { foreignKey: 'uploadedBy' });
Dataset.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

module.exports = {
  sequelize,
  User,
  Dataset,
  DatasetProfile,
  ColumnProfile,
  QualityIssue,
  QualityRule,
};
