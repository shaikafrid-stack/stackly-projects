const { Op } = require('sequelize');
const { Ticket, User, SLATracking, TicketComment } = require('../models');
const { getSLADeadlines } = require('../utils/slaHelper');
const { logActivity } = require('../utils/activityLogger');

exports.createTicket = async (req, res) => {
  try {
    const { ticket_title, ticket_description, priority, category } = req.body;
    const ticket = await Ticket.create({
      customer_id: req.user.id, ticket_title, ticket_description,
      priority: priority || 'medium', category, status: 'open',
    });
    const deadlines = getSLADeadlines(ticket.priority);
    await SLATracking.create({ ticket_id: ticket.id, ...deadlines, breached_status: false });
    await logActivity(req.user.id, `Created ticket: ${ticket_title}`, 'Tickets');
    res.status(201).json({ ticket });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTickets = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const where = {};
    if (req.user.role === 'customer') where.customer_id = req.user.id;
    if (req.user.role === 'agent') where.assigned_agent_id = req.user.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where[Op.or] = [
      { ticket_title: { [Op.like]: `%${search}%` } },
      { ticket_description: { [Op.like]: `%${search}%` } },
    ];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Ticket.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: SLATracking, as: 'sla' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ tickets: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: SLATracking, as: 'sla' },
        { model: TicketComment, as: 'comments', include: [{ model: User, attributes: ['id', 'name', 'role'] }] },
      ],
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role === 'customer' && ticket.customer_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });
    res.json({ ticket });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const { status, priority, assigned_agent_id, ticket_title, ticket_description, category } = req.body;
    const updates = {};
    if (req.user.role === 'admin') Object.assign(updates, { status, priority, assigned_agent_id, ticket_title, ticket_description, category });
    else if (req.user.role === 'agent') { if (status) updates.status = status; }
    else return res.status(403).json({ message: 'Access denied' });
    await ticket.update(updates);
    await logActivity(req.user.id, `Updated ticket #${ticket.id}`, 'Tickets');
    res.json({ ticket });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    await ticket.destroy();
    await logActivity(req.user.id, `Deleted ticket #${req.params.id}`, 'Tickets');
    res.json({ message: 'Ticket deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
