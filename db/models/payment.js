"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      amount: {
        type: DataTypes.INTEGER,
      },
      subscriptionId: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      invoiceId: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      paymentIntentId: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      paymentType: {
        type: DataTypes.STRING,
      },
      paymentMethod: { type: DataTypes.JSON },
      paymentStatus: { type: DataTypes.STRING },
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
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: true,
    }
  );
  return Payment;
};
