const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  training_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  certificate_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  issued_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'certifications',
});

module.exports = Certification;
