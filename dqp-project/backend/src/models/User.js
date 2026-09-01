const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('ADMINISTRATOR', 'DATA_ANALYST', 'DATA_STEWARD'),
    allowNull: false,
    defaultValue: 'DATA_ANALYST',
  },
}, {
  tableName: 'users',
});

module.exports = User;
