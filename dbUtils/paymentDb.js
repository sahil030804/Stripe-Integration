const { Op } = require('sequelize');
const { Payment } = require('../db/models');
const common = require('../constants/common');

class PaymentDb extends Payment {
  async addPaymentDataInDb(paymentData) {
    const result = await Payment.create(paymentData);
    return result.toJSON();
  }

  async updatePaymentDataInDb(paymentData, id) {
    const result = await Payment.update(paymentData, {
      where: {
        [Op.or]: [
          {
            paymentIntentId: id,
          },
          {
            invoiceId: id,
          },
        ],
      },
      returning: true,
      plain: true,
    });
    return result[1];
  }

  async getPaymentStatusFromDb(id) {
    const status = await Payment.findOne({
      where: { [Op.or]: [{ invoiceId: id }, { paymentIntentId: id }] },
      attributes: ['paymentStatus'],
      raw: true,
    });
    return status;
  }

  async checkSubscriptionExist(subscriptionId) {
    const result = await Payment.findAndCountAll({
      where: { subscriptionId },
    });
    return result.count;
  }

  async purchaseHistoryOfCustomer(customer, attributes = null) {
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
          { paymentType: type, paymentStatus: 'succeeded' },
        ],
      },
      attributes,
      raw: true,
    });

    return activePlans;
  }

  async checkExistingPaymentIntent(paymentIntentId) {
    const paymentIntent = await Payment.findOne({
      where: { paymentIntentId },
    });

    return paymentIntent;
  }
  async checkExistingInvoice(invoiceId) {
    const invoice = await Payment.findOne({
      where: { invoiceId },
    });

    return invoice;
  }
}

module.exports = new PaymentDb();
module.exports.PaymentMdl = Payment;
