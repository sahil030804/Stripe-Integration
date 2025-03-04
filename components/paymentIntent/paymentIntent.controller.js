const paymentIntentService = require("./paymentIntent.service");

paymentIntentService;
class PaymentIntentController {
  async createPaymentIntent(req, res, next) {
    try {
      const result = await paymentIntentService.createPaymentIntent(
        req.body,
        req.user.stripeCustomerId
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
  async confirmPaymentIntent(req, res, next) {
    console.log({ body: req.body });

    try {
      const result = await paymentIntentService.confirmPaymentIntent(
        req.body.paymentIntentId,
        req.body.paymentMethodId
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentIntentController();
