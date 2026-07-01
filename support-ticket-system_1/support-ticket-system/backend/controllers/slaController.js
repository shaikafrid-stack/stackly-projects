const { SLATracking, Ticket, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllSLA = async (req, res) => {
  try {
    const slaRecords = await SLATracking.findAll({
      include: [{
        model: Ticket,
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name'] },
          { model: User, as: 'agent', attributes: ['id', 'name'] },
        ],
      }],
      order: [['resolution_deadline', 'ASC']],
    });
    // Update breach status
    const now = new Date();
    for (const sla of slaRecords) {
      if (!sla.breached_status && now > sla.resolution_deadline) {
        await sla.update({ breached_status: true });
      }
    }
    res.json({ sla: slaRecords });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSLA = async (req, res) => {
  try {
    const sla = await SLATracking.findOne({ where: { ticket_id: req.params.ticket_id } });
    if (!sla) return res.status(404).json({ message: 'SLA record not found' });
    await sla.update(req.body);
    res.json({ sla });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
