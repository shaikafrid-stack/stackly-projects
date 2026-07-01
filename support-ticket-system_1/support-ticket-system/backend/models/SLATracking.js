const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SLATracking = sequelize.define('SLATracking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  response_deadline: { type: DataTypes.DATE, allowNull: false },
  resolution_deadline: { type: DataTypes.DATE, allowNull: false },
  breached_status: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'sla_tracking',
  timestamps: false,
});

module.exports = SLATracking;
