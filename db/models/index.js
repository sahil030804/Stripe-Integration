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
const Plan = require("./plan")(sequelize, Sequelize.DataTypes);
const Blacklist = require("./blacklist")(sequelize, Sequelize.DataTypes);
const Payment = require("./payment")(sequelize, Sequelize.DataTypes);
const Promocode = require("./promocode")(sequelize, Sequelize.DataTypes);

db.User = User;
db.RefreshToken = RefreshToken;
db.Plan = Plan;
db.Blacklist = Blacklist;
db.Payment = Payment;
db.Promocode = Promocode;

User.hasMany(Payment, { as: "payments", foreignKey: "userId" });
Payment.belongsTo(User, { as: "user", foreignKey: "userId" });

User.hasMany(Promocode, {
  as: "createdPromocodes",
  foreignKey: "createdBy",
});
Promocode.belongsTo(User, { as: "createdByUser", foreignKey: "createdBy" });
Promocode.belongsTo(User, { as: "updatedByUser", foreignKey: "updatedBy" });
Promocode.belongsTo(User, { as: "deletedByUser", foreignKey: "deletedBy" });

db.sequelize = sequelize;

module.exports = db;
