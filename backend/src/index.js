require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Always allows:
//   - No origin (curl, Postman, server-to-server)
//   - Any *.vercel.app subdomain (your Vercel preview/production deploys)
//   - localhost for local development
// Add extra origins via ALLOWED_ORIGINS env var on Render (comma-separated)
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  ...extraOrigins,
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any Vercel app subdomain (covers preview deploys too)
    if (/^https:\/\/[^.]+\.vercel\.app$/.test(origin)) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.has(origin)) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

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
app.use('/api/reminders', require('./routes/reminders'));

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
