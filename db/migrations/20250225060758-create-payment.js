'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('payments', {
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
        references: {
          model: 'users',
        },
      },
      amount: {
        type: DataTypes.INTEGER,
      },
      currency: {
        type: DataTypes.STRING,
      },
      subscriptionId: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      invoiceId: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      paymentIntentId: {
        type: DataTypes.STRING,
        defaultValue: '',
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
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('payments');
  },
};
