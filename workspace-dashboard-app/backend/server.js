require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const memberRoutes = require('./routes/members');
const dashboardRoutes = require('./routes/dashboards');
const activityRoutes = require('./routes/activity');
const dashboardSummaryRoutes = require('./routes/dashboardSummary');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:id/members', memberRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardSummaryRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
