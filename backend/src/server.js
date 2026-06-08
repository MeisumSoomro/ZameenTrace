require('dotenv').config();

const { app } = require('./app');
const { env } = require('./config/env');

app.listen(env.port, () => {
  console.warn(
    `ZameenTrace backend scaffold running on http://localhost:${env.port}`
  );
});
