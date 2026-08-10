require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const tagRoutes = require('./routes/tagRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'task23-backend' }));

app.use('/api', authRoutes);
app.use('/api/datasets', datasetRoutes);
// Nested resources: /api/datasets/:id/tags, /api/datasets/:id/activity
app.use('/api/datasets/:id/tags', tagRoutes);
app.use('/api/datasets/:id/activity', activityRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Task 23 backend running on http://localhost:${PORT}`);
});
