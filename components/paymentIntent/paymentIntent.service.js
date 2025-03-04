const stripeHelper = require("../../utils/stripeHelper");

class PaymentIntentService {
  async createPaymentIntent(intentData, customerId) {
    try {
      const paymentIntent = await stripeHelper.createPaymentIntent(
        intentData.amount,
        intentData.currency,
        intentData.priceId,
        customerId
      );
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const result = await stripeHelper.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId
      );
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PaymentIntentService();
