// backend/src/utils/db.js
// PostgreSQL connection pool using the 'pg' library.
// The pool manages multiple database connections and reuses them across requests,
// which is much more efficient than opening a new connection per query.
// Connection string is read from DATABASE_URL in the environment config.

const { Pool } = require('pg');
const { env } = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl || undefined,
});

module.exports = { pool };
