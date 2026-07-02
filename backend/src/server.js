// backend/src/server.js
// Entry point — loads environment variables, imports the configured Express app,
// and starts listening on the configured port.
// This file is intentionally minimal; all middleware and routing is in app.js.

require('dotenv').config();

const { app } = require('./app');
const { env } = require('./config/env');

// Start the HTTP server. The port defaults to 4000 (see config/env.js).
app.listen(env.port, () => {
  console.warn(
    `ZameenTrace backend running on http://localhost:${env.port}`
  );
});
