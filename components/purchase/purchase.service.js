const paymentDb = require("../../dbUtils/paymentDb");
const stripeHelper = require("../../utils/stripeHelper");

class PurchaseService {
  async checkPaymentStatus(id) {
    try {
      const paymentStatus = await paymentDb.getPaymentStatusFromDb(id);
      return paymentStatus;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getActiveSubscriptionOfUser(customerId) {
    try {
      const subscriptions = await stripeHelper.getSubscriptionByCustomerId(
        customerId
      );

      return { subscriptions };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PurchaseService();
