const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TrainingProgram = sequelize.define('TrainingProgram', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  trainer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING, // e.g. "4 weeks", "20 hours"
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
  },
}, {
  tableName: 'training_programs',
});

module.exports = TrainingProgram;
