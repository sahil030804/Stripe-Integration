"use strict";

const common = require("../../constants/common");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "products",
      [
        {
          name: "Elite Plan",
          price: 250,
          currency: common.currency.USD,
          stripeProductId: "prod_RorL8TAlzOjMGP",
          stripePriceId: "price_1QvDcbSJvKxGyYS6T14osHvE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Premium Plan",
          price: 500,
          currency: common.currency.USD,
          stripeProductId: "prod_RorSts8YSzXHtR",
          stripePriceId: "price_1QvDjpSJvKxGyYS6OiYsPdrJ",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {});
  },
};
