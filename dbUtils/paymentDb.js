const { Op } = require("sequelize");
const { Payment } = require("../db/models");
const common = require("../constants/common");

class PaymentDb extends Payment {
  async addPaymentDataInDb(paymentData) {
    await Payment.create(paymentData);
  }

  async updatePaymentDataInDb(paymentData, paymentIntentId, invoiceId) {
    await Payment.update(paymentData, {
      where: {
        paymentIntentId: paymentIntentId,
      },
      returning: true,
    });
  }

  async getPaymentStatusFromDb(id) {
    const status = await Payment.findOne({
      where: { [Op.or]: [{ invoiceId: id }, { paymentIntentId: id }] },
      attributes: ["paymentStatus"],
      raw: true,
    });
    return status;
  }
  async checkSubscriptionExist(subscriptionId) {
    console.log({ subscriptionId });

    const result = await Payment.findAndCountAll({
      where: { subscriptionId },
    });
    return result.count;
  }

  async purchaseHistoryOfCustomer(customer, attributes) {
    const history = await Payment.findAll({
      where: {
        [Op.and]: [
          { stripeCustomerId: customer },
          {
            paymentStatus: {
              [Op.or]: [
                common.PAYMENT_STATUS.PAID,
                common.PAYMENT_STATUS.SUCCEEDED,
              ],
            },
          },
        ],
      },
      attributes,
      raw: true,
    });

    return history;
  }

  async getActivePlanOfUser(stripeCustomerId, type, attributes) {
    const activePlans = await Payment.findAll({
      where: {
        [Op.and]: [
          { stripeCustomerId },
          { paymentType: type, paymentStatus: "succeeded" },
        ],
      },
      attributes,
      raw: true,
    });

    return activePlans;
  }
}

module.exports = new PaymentDb();
module.exports.PaymentMdl = Payment;
