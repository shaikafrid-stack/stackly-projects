/**
 * Seeds the database with demo users and sample datasets so the
 * application can be explored immediately after setup.
 *
 * Usage: npm run seed  (from the backend/ directory)
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const { User, Dataset } = require('../src/models');
require('../src/models'); // register associations

const DEMO_USERS = [
  { name: 'Alice Admin', email: 'admin@dqp.com', password: 'Admin@123', role: 'ADMINISTRATOR' },
  { name: 'Dana Analyst', email: 'analyst@dqp.com', password: 'Analyst@123', role: 'DATA_ANALYST' },
  { name: 'Steve Steward', email: 'steward@dqp.com', password: 'Steward@123', role: 'DATA_STEWARD' },
];

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed });
      console.log(`Created user: ${u.email} / ${u.password} (${u.role})`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  const admin = await User.findOne({ where: { email: 'admin@dqp.com' } });

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const samples = [
    { file: 'customers.csv', name: 'Customer Master Data' },
    { file: 'orders.csv', name: 'Orders Transactions' },
  ];

  for (const s of samples) {
    const src = path.join(__dirname, 'sample-data', s.file);
    const destName = `${Date.now()}-${s.file}`;
    const dest = path.join(uploadsDir, destName);
    fs.copyFileSync(src, dest);

    const existing = await Dataset.findOne({ where: { name: s.name } });
    if (!existing) {
      await Dataset.create({
        name: s.name,
        fileName: s.file,
        filePath: dest,
        fileType: 'CSV',
        status: 'PROCESSED',
        uploadedBy: admin ? admin.id : null,
      });
      console.log(`Created sample dataset: ${s.name}`);
    } else {
      console.log(`Sample dataset already exists: ${s.name}`);
    }
  }

  console.log('\nSeed complete. You can now log in with any of the demo accounts above.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
