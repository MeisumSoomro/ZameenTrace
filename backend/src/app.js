// backend/src/app.js
// Express application bootstrap — configures middleware and mounts API routes.
// Middleware order matters:
//   1. helmet — sets security headers (XSS, HSTS, etc.)
//   2. cors — allows frontend origin to make cross-origin requests
//   3. express.json — parses JSON request bodies
//   4. morgan — logs HTTP requests for debugging
//   5. routes — handles actual API logic
//   6. errorMiddleware — catches all thrown/next(error) errors and returns JSON

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { env } = require('./config/env');
const apiRoutes = require('./routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

// Security headers — protects against common web vulnerabilities.
app.use(helmet());

// CORS — the frontend runs on a different port (3000) than the backend (4000).
app.use(
  cors({
    origin: env.corsOrigin,
  })
);

// JSON body parser — the 1mb limit prevents oversized payloads from consuming memory.
app.use(express.json({ limit: env.requestBodyLimit }));

// Request logging — 'dev' format shows method, url, status, and response time.
app.use(morgan('dev'));

// Health check — used by Docker, load balancers, and deployment pipelines
// to confirm the backend is running and responsive.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zameentrace-backend' });
});

// Mount all API routes under the /api prefix.
app.use('/api', apiRoutes);

// Global error handler — must be registered last.
app.use(errorMiddleware);

module.exports = { app };
