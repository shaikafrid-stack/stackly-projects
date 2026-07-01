const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_agent_id: { type: DataTypes.INTEGER, allowNull: true },
  ticket_title: { type: DataTypes.STRING(255), allowNull: false },
  ticket_description: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  category: { type: DataTypes.STRING(100), allowNull: false },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'on_hold', 'resolved', 'closed'), defaultValue: 'open' },
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Ticket;
