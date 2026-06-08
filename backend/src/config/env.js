const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-secure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '1mb',
  demoAuthEnabled: process.env.DEMO_AUTH_ENABLED === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingVars.join(', ')}`
  );
  console.error('Please check your .env file and ensure all required vars are set.');
  process.exit(1);
}

module.exports = { env };
