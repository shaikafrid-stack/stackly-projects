const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class DatasetColumn extends Model {}

DatasetColumn.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dataset_id: { type: DataTypes.INTEGER, allowNull: false },
  column_name: { type: DataTypes.STRING(200), allowNull: false },
  data_type: {
    type: DataTypes.ENUM('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE'),
    allowNull: false,
    defaultValue: 'STRING'
  },
  nullable: { type: DataTypes.BOOLEAN, defaultValue: true },
  column_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  sequelize,
  modelName: 'DatasetColumn',
  tableName: 'dataset_columns'
});

module.exports = DatasetColumn;
