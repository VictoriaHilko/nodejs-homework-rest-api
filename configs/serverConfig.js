const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? './envs/production.env' : './envs/development.env',
});

const serverConfig = {
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017',
  environment: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'secret-phrase',
  jwtExpires: process.env.JWT_EXPIRES ?? '1d',
  sendgridToken: process.env.SESENDGRID_TOKEN ?? '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'
};

module.exports = serverConfig;
