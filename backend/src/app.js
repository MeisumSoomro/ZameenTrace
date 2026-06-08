const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { env } = require('./config/env');
const apiRoutes = require('./routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
  })
);
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zameentrace-backend' });
});

app.use('/api', apiRoutes);
app.use(errorMiddleware);

module.exports = { app };
