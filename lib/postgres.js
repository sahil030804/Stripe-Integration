const { sequelize } = require("../db/models");

async function connectPostgres() {
  try {
    await sequelize.authenticate();
    console.log("Database connected succcessfully");
  } catch (error) {
    console.log("Error during connect to database:", error);
  }
}

module.exports = connectPostgres;
