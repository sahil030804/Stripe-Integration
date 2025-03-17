const planService = require('./plan.service');

class PlanController {
  async createPlan(req, res, next) {
    try {
      const plans = await planService.createPlan(req.body);
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }
  async updatePlan(req, res, next) {
    try {
      const plans = await planService.updatePlan(req.body, req.params.id);
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }

  async getAllPlans(req, res, next) {
    try {
      const plans = await planService.getAllPlans(
        req.body.page,
        req.body.limit
      );
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }
  async getOnetimePlans(req, res, next) {
    try {
      const plans = await planService.getOnetimePlans();
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }
  async getSubscriptionPlans(req, res, next) {
    try {
      const plans = await planService.getSubscriptionPlans();
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }
  async getSinglePlan(req, res, next) {
    try {
      const plans = await planService.getSinglePlan(req.params.id);
      res.status(200).json(plans);
    } catch (err) {
      next(err);
    }
  }

  async deletePlan(req, res, next) {
    try {
      const result = await planService.deletePlan(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new PlanController();
