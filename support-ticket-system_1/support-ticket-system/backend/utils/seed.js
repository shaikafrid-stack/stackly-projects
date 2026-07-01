require('dotenv').config();
const { sequelize, User, Ticket, SLATracking } = require('../models');
const { getSLADeadlines } = require('./slaHelper');

async function seed() {
  await sequelize.sync({ force: true });

  // NOTE: pass PLAIN TEXT passwords here — the User model's beforeCreate
  // hook automatically hashes them. Pre-hashing here would double-hash
  // the password and break login.
  const admin = await User.create({ name: 'Admin User', email: 'admin@support.com', password: 'Admin@123', role: 'admin' });
  const agent1 = await User.create({ name: 'Agent Alice', email: 'alice@support.com', password: 'Agent@123', role: 'agent' });
  const agent2 = await User.create({ name: 'Agent Bob', email: 'bob@support.com', password: 'Agent@123', role: 'agent' });
  const cust1 = await User.create({ name: 'Customer John', email: 'john@example.com', password: 'Customer@123', role: 'customer' });
  const cust2 = await User.create({ name: 'Customer Jane', email: 'jane@example.com', password: 'Customer@123', role: 'customer' });

  const tickets = [
    { customer_id: cust1.id, assigned_agent_id: agent1.id, ticket_title: 'Cannot login to portal', ticket_description: 'Getting 401 error when trying to login.', priority: 'high', category: 'Authentication', status: 'in_progress' },
    { customer_id: cust1.id, assigned_agent_id: null, ticket_title: 'Invoice not received', ticket_description: 'Did not receive invoice for last month.', priority: 'medium', category: 'Billing', status: 'open' },
    { customer_id: cust2.id, assigned_agent_id: agent2.id, ticket_title: 'App crashes on startup', ticket_description: 'Mobile app crashes immediately on launch.', priority: 'critical', category: 'Bug', status: 'open' },
    { customer_id: cust2.id, assigned_agent_id: agent1.id, ticket_title: 'Feature request: Dark mode', ticket_description: 'Would love a dark mode option.', priority: 'low', category: 'Feature Request', status: 'resolved' },
    { customer_id: cust1.id, assigned_agent_id: agent2.id, ticket_title: 'Slow response times', ticket_description: 'Dashboard takes over 30 seconds to load.', priority: 'high', category: 'Performance', status: 'on_hold' },
  ];

  for (const t of tickets) {
    const ticket = await Ticket.create(t);
    const dl = getSLADeadlines(t.priority);
    const breached = t.status === 'resolved' ? false : Math.random() > 0.7;
    await SLATracking.create({ ticket_id: ticket.id, ...dl, breached_status: breached });
  }

  console.log('✅ Seed complete!\nCredentials:\n  Admin: admin@support.com / Admin@123\n  Agent: alice@support.com / Agent@123\n  Customer: john@example.com / Customer@123');
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
