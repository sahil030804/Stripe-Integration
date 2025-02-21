const Sequelize = require("sequelize");
const process = require("process");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.resolve(
  __dirname,
  "../../config/sequelizeConfig.js"
))[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const User = require("./user")(sequelize, Sequelize.DataTypes);
const RefreshToken = require("./refreshtoken")(sequelize, Sequelize.DataTypes);
const Product = require("./product")(sequelize, Sequelize.DataTypes);
const Blacklist = require("./blacklist")(sequelize, Sequelize.DataTypes);

db.User = User;
db.RefreshToken = RefreshToken;
db.Product = Product;
db.Blacklist = Blacklist;

db.sequelize = sequelize;

module.exports = db;
