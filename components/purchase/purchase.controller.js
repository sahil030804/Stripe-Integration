const purchaseService = require("./purchase.service");

class PurchaseController {
  async checkPaymentStatus(req, res, next) {
    try {
      const result = await purchaseService.checkPaymentStatus(req.params.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
  async getActiveSubscriptionOfUser(req, res, next) {
    try {
      const result = await purchaseService.getActiveSubscriptionOfUser(
        req.user.stripeCustomerId
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PurchaseController();
