const Sequelize = require("sequelize");
const process = require("process");
const config = require("../../config/sequelizeConfig");
const env = process.env.NODE_ENV || "development";

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(config[env]);
} else {
  sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
  );
}

const User = require("./user")(sequelize, Sequelize.DataTypes);
const RefreshToken = require("./refreshtoken")(sequelize, Sequelize.DataTypes);

db.User = User;
db.RefreshToken = RefreshToken;
db.sequelize = sequelize;

module.exports = db;
