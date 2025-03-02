const { Op } = require("sequelize");
const { Payment } = require("../db/models");

class PaymentDb extends Payment {
  async addPaymentDataInDb(paymentData) {
    await Payment.create(paymentData);
  }

  async updatePaymentDataInDb(paymentData, paymentIntentId, invoiceId) {
    await Payment.update(paymentData, {
      where: {
        [Op.or]: [
          { paymentIntentId: paymentIntentId },
          { invoiceId: invoiceId },
        ],
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
}

module.exports = new PaymentDb();
module.exports.PaymentMdl = Payment;
