require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function seed() {
  await sequelize.sync();

  const users = [
    { name: 'Admin User', email: 'admin@example.com', password: 'Admin@123', role: 'ADMIN' },
    { name: 'Analyst User', email: 'analyst@example.com', password: 'Analyst@123', role: 'ANALYST' }
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      console.log(`Skipping ${u.email} (already exists)`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`Created ${u.role} user: ${u.email} / ${u.password}`);
  }

  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
