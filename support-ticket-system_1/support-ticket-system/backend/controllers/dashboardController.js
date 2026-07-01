const { Ticket, User, SLATracking, ActivityLog } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

exports.adminDashboard = async (req, res) => {
  try {
    const [totalTickets, openTickets, resolvedTickets, agents, slaBreaches, ticketsByStatus, ticketsByPriority, recentActivity] = await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'open' } }),
      Ticket.count({ where: { status: 'resolved' } }),
      User.count({ where: { role: 'agent' } }),
      SLATracking.count({ where: { breached_status: true } }),
      Ticket.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      Ticket.findAll({ attributes: ['priority', [fn('COUNT', col('id')), 'count']], group: ['priority'], raw: true }),
      ActivityLog.findAll({ limit: 10, order: [['created_at', 'DESC']], include: [{ model: User, attributes: ['name'] }] }),
    ]);
    const agentStats = await Ticket.findAll({
      attributes: ['assigned_agent_id', [fn('COUNT', col('Ticket.id')), 'count']],
      where: { assigned_agent_id: { [Op.ne]: null }, status: 'resolved' },
      include: [{ model: User, as: 'agent', attributes: ['name'] }],
      group: ['assigned_agent_id'],
      raw: true,
    });
    res.json({ totalTickets, openTickets, resolvedTickets, agents, slaBreaches, ticketsByStatus, ticketsByPriority, agentStats, recentActivity });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.agentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;
    const [assigned, inProgress, resolved, recent] = await Promise.all([
      Ticket.count({ where: { assigned_agent_id: agentId } }),
      Ticket.count({ where: { assigned_agent_id: agentId, status: 'in_progress' } }),
      Ticket.count({ where: { assigned_agent_id: agentId, status: 'resolved' } }),
      Ticket.findAll({ where: { assigned_agent_id: agentId }, limit: 5, order: [['updated_at', 'DESC']], include: [{ model: User, as: 'customer', attributes: ['name'] }] }),
    ]);
    res.json({ assigned, inProgress, resolved, recentTickets: recent });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.customerDashboard = async (req, res) => {
  try {
    const customerId = req.user.id;
    const [total, open, resolved, recent] = await Promise.all([
      Ticket.count({ where: { customer_id: customerId } }),
      Ticket.count({ where: { customer_id: customerId, status: 'open' } }),
      Ticket.count({ where: { customer_id: customerId, status: 'resolved' } }),
      Ticket.findAll({ where: { customer_id: customerId }, limit: 5, order: [['created_at', 'DESC']], include: [{ model: SLATracking, as: 'sla' }] }),
    ]);
    res.json({ total, open, resolved, recentTickets: recent });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
