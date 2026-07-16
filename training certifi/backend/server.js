require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sequelize = require('./config/db');
require('./models'); // load models & associations

const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // sync (use migrations in production; sync is fine for this assignment)
    await sequelize.sync({ alter: true });
    console.log('Models synced.');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = app;
