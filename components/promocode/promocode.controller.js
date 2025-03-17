const promocodeService = require('./promocode.service');

promocodeService;
class PromocodeController {
  async createPromocode(req, res, next) {
    try {
      const code = await promocodeService.createPromocode(
        req.body,
        req.user.id
      );
      res.status(201).json(code);
    } catch (err) {
      next(err);
    }
  }
  async updatePromocode(req, res, next) {
    try {
      const code = await promocodeService.updatePromocode(
        req.body.stripePromoCodeId,
        req.body,
        req.user.id
      );
      res.status(201).json(code);
    } catch (err) {
      next(err);
    }
  }
  async deletePromocode(req, res, next) {
    try {
      const result = await promocodeService.deletePromocode(
        req.body.stripePromoCodeId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
  async getAllActivePromocode(req, res, next) {
    try {
      const codes = await promocodeService.getAllActivePromocode(
        req.body.amount,
        req.body.currency,
        req.body.page,
        req.body.limit
      );
      res.status(200).json(codes);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PromocodeController();
