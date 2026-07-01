const { TicketComment, Ticket, User } = require('../models');
const { logActivity } = require('../utils/activityLogger');

exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const comment = await TicketComment.create({
      ticket_id: req.params.id, user_id: req.user.id, comment: req.body.comment,
    });
    await logActivity(req.user.id, `Added comment to ticket #${req.params.id}`, 'Comments');
    const full = await TicketComment.findByPk(comment.id, { include: [{ model: User, attributes: ['id', 'name', 'role'] }] });
    res.status(201).json({ comment: full });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await TicketComment.findAll({
      where: { ticket_id: req.params.id },
      include: [{ model: User, attributes: ['id', 'name', 'role'] }],
      order: [['created_at', 'ASC']],
    });
    res.json({ comments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
