const { Pool } = require('pg');
const { env } = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl || undefined,
});

module.exports = { pool };
