const dotenv = require("dotenv-safe");
dotenv.config({
  path: "./.env",
  sample: "./.env.example",
});

module.exports = {
  dbConfig: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
  },
  serverConfig: {
    port: process.env.PORT,
    SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
  },
  redis: {
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  },
  jwtConfig: {
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  },
  stripeConfig: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SECRET_KEY: process.env.WEBHOOK_SECRET_KEY,
  },
};
