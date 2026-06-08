describe('Environment Config', () => {
  let env;

  beforeAll(() => {
    // Set required env vars for testing
    process.env.DATABASE_URL = 'postgres://test:test@localhost/test';
    process.env.JWT_SECRET = 'test-secret-key';

    // Clear the require cache to reload with new env vars
    delete require.cache[require.resolve('../config/env')];
    const envModule = require('../config/env');
    env = envModule.env;
  });

  test('should have required env variables', () => {
    expect(env.port).toBeDefined();
    expect(env.jwtSecret).toBeDefined();
    expect(env.databaseUrl).toBeDefined();
  });

  test('port should be a number or valid number string', () => {
    expect(Number(env.port)).toBeGreaterThan(0);
  });

  test('jwtSecret should not be empty', () => {
    expect(env.jwtSecret).toBeTruthy();
  });
});
