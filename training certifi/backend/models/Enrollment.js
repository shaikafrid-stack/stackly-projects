const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
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
  enrollment_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  completion_status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending',
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  attendance: {
    type: DataTypes.ENUM('not_marked', 'present', 'absent'),
    defaultValue: 'not_marked',
  },
}, {
  tableName: 'enrollments',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'training_id'],
      name: 'unique_employee_training',
    },
  ],
});

module.exports = Enrollment;
