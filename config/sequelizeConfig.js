const { dbConfig } = require("./config");

module.exports = {
  development: {
    ...dbConfig,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false,
  },
};
