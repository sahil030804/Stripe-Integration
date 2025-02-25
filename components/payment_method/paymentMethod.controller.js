const paymentMethodService = require("./paymentMethod.service");

class PaymentMethodController {
  async createPaymentMethod(req, res, next) {
    try {
      const paymentMethod = await paymentMethodService.createPaymentMethod(
        req.body.type,
        req.body.paymentDetails,
        req.body.billingDetails,
        req.user.stripeCustomerId
      );

      res.status(200).json(paymentMethod);
    } catch (err) {
      next(err);
    }
  }
  async getAllPaymentMethodsOfCustomer(req, res, next) {
    try {
      const paymentMethods =
        await paymentMethodService.getAllPaymentMethodsOfCustomer(
          "cus_RoWouEXxeln7R7"
        );
      res.status(200).json(paymentMethods);
    } catch (err) {
      next(err);
    }
  }
  async setDefaultMethodOfCustomer(req, res, next) {
    try {
      const result = await paymentMethodService.setDefaultMethodOfCustomer(
        req.user.stripeCustomerId,
        req.body.id
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
  async deletePaymentMethodOfCustomer(req, res, next) {
    try {
      const result = await paymentMethodService.deletePaymentMethodOfCustomer(
        req.user.stripeCustomerId,
        req.body.id
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentMethodController();
