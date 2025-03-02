const stripeHelper = require("../../utils/stripeHelper");

class SubscriptionService {
  async createSubscription(stripeCustomerId, priceId, paymentMethodId) {
    try {
      const subscription = await stripeHelper.createSubscription(
        stripeCustomerId,
        priceId,
        paymentMethodId
      );
      return subscription;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async updateSubscription(subscriptionId, paymentMethodId) {
    try {
      const subscription = await stripeHelper.updateSubscription(
        subscriptionId,
        paymentMethodId
      );
      return { message: "Subscription updated.", subscription };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async cancelSubscription(subscriptionId, feedback) {
    try {
      const subscription = await stripeHelper.cancelSubscription(
        subscriptionId,
        feedback
      );
      return { message: "Subscription cancelled.", subscription };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
module.exports = new SubscriptionService();
