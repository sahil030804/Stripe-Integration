'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class Promocode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Promocode.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      stripeCouponId: {
        type: Sequelize.STRING,
      },
      stripePromoCodeId: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      currency: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.ENUM('forever', 'once', 'repeating'),
      },
      duration_in_months: {
        type: Sequelize.INTEGER,
      },
      amount_off: {
        type: Sequelize.INTEGER,
      },
      percent_off: {
        type: Sequelize.INTEGER,
      },
      max_redemptions: {
        type: Sequelize.INTEGER,
      },
      times_redeemed: {
        type: Sequelize.INTEGER,
      },
      minimum_amount: {
        type: Sequelize.INTEGER,
      },
      minimum_amount_currency: {
        type: Sequelize.STRING,
      },
      expiresAt: {
        type: Sequelize.DATE,
      },
      isActive: {
        type: Sequelize.ENUM('true', 'false'),
        defaultValue: 'true',
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
        },
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
        },
        defaultValue: null,
      },
      deletedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
        },
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Promocode',
      tableName: 'promocodes',
      timestamps: true,
    }
  );
  return Promocode;
};
