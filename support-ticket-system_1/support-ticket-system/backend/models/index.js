const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const TicketComment = require('./TicketComment');
const SLATracking = require('./SLATracking');
const ActivityLog = require('./ActivityLog');

// Associations
Ticket.belongsTo(User, { as: 'customer', foreignKey: 'customer_id' });
Ticket.belongsTo(User, { as: 'agent', foreignKey: 'assigned_agent_id' });
User.hasMany(Ticket, { as: 'tickets', foreignKey: 'customer_id' });

TicketComment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketComment.belongsTo(User, { foreignKey: 'user_id' });
Ticket.hasMany(TicketComment, { as: 'comments', foreignKey: 'ticket_id' });

SLATracking.belongsTo(Ticket, { foreignKey: 'ticket_id' });
Ticket.hasOne(SLATracking, { as: 'sla', foreignKey: 'ticket_id' });

ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Ticket, TicketComment, SLATracking, ActivityLog };
