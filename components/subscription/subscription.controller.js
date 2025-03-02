const subcriptionService = require("./subscription.service");

class SubscriptionController {
  async createSubscription(req, res, next) {
    try {
      const subscription = await subcriptionService.createSubscription(
        req.user.stripeCustomerId,
        req.body.priceId,
        req.body.paymentMethodId
      );
      res.status(200).json(subscription);
    } catch (err) {
      next(err);
    }
  }
  async updateSubscription(req, res, next) {
    try {
      const subscription = await subcriptionService.updateSubscription(
        req.body.subscriptionId,
        req.body.paymentMethodId
      );
      res.status(200).json(subscription);
    } catch (err) {
      next(err);
    }
  }
  async cancelSubscription(req, res, next) {
    try {
      const subscription = await subcriptionService.cancelSubscription(
        req.body.subscriptionId,
        req.body.feedback
      );
      res.status(200).json(subscription);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubscriptionController();
