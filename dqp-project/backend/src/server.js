require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models'); // register associations

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync(); // creates tables if they do not exist
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`DQP backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
