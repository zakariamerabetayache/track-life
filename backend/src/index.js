require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10kb' })); // prevent oversized payloads

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/weeks', require('./routes/weeks'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/day-goals', require('./routes/dayGoals'));
app.use('/api/completions', require('./routes/completions'));
app.use('/api/week-goals', require('./routes/weekGoals'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler — catches any route not matched above
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
