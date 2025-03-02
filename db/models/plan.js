"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Plan.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: { type: DataTypes.STRING },
      currency: {
        type: DataTypes.STRING,
      },
      stripeProductId: {
        type: DataTypes.STRING,
      },
      stripePricesId: {
        type: DataTypes.JSONB,
        defaultValue: {
          onetime: [],
          subscription: [],
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Plan",
      tableName: "plans",
      paranoid: true,
      timestamps: true,
    }
  );
  return Plan;
};
