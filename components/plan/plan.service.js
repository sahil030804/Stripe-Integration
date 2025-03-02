const common = require("../../constants/common");
const planDb = require("../../dbUtils/planDb");
const stripeHelper = require("../../utils/stripeHelper");

class PlanService {
  async createPlan(planData) {
    let onetime;
    let subscription;
    try {
      const stripeProduct = await stripeHelper.createProductInStripe(planData);
      onetime = await Promise.all(
        (planData.onetime || []).map(async (data) => {
          const stripePrice = await stripeHelper.createOnetimePriceInStripe(
            data,
            stripeProduct.id
          );
          return {
            priceId: stripePrice.id,
            amount: stripePrice.unit_amount / 100,
            validity: stripePrice.metadata.validity,
          };
        })
      );

      subscription = await Promise.all(
        (planData.subscription || []).map(async (data) => {
          const stripePrice = await stripeHelper.createRecurringPriceInStripe(
            data,
            stripeProduct.id
          );
          return {
            priceId: stripePrice.id,
            amount: stripePrice.unit_amount / 100,
            interval: stripePrice.recurring.interval,
          };
        })
      );
      planData.stripeProductId = stripeProduct.id;
      const plan = await planDb.addPlanInDb(planData, onetime, subscription);
      return { plan };
    } catch (err) {
      throw new Error(err);
    }
  }
  async updatePlan(planData, planId) {
    try {
      const existingPlan = await planDb.findPlanById(planId);
      if (!existingPlan) {
        throw new Error("PLAN_NOT_FOUND");
      }
      await stripeHelper.updateProductInStripe(
        existingPlan.stripeProductId,
        planData
      );
      const onetime = await Promise.all(
        (planData.onetime || []).map(async (data) => {
          const stripePrice = await stripeHelper.createOnetimePriceInStripe(
            data,
            existingPlan.stripeProductId
          );
          return {
            priceId: stripePrice.id,
            amount: stripePrice.unit_amount / 100,
            validity: stripePrice.metadata.validity,
          };
        })
      );

      const subscription = await Promise.all(
        (planData.subscription || []).map(async (data) => {
          const stripePrice = await stripeHelper.createRecurringPriceInStripe(
            data,
            existingPlan.stripeProductId
          );
          return {
            priceId: stripePrice.id,
            amount: stripePrice.unit_amount / 100,
            interval: stripePrice.recurring.interval,
          };
        })
      );

      const updatedplans = await planDb.updatePlanInDb(
        planData,
        onetime,
        subscription,
        planId
      );

      return { updatedplans };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getAllPlans(page, limit) {
    try {
      const plans = await planDb.getAllPlansFromDb(page, limit);
      if (!plans) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { plans };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getOnetimePlans() {
    try {
      const oneTimePlans = await planDb.getAllPlansByType(
        common.PLAN_TYPE.ONETIME
      );

      if (!oneTimePlans) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { oneTimePlans };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getSubscriptionPlans() {
    try {
      const plans = await planDb.getAllPlansByType(
        common.PLAN_TYPE.SUBSCRIPTION
      );

      if (!plans) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { plans };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getSinglePlan(planId) {
    try {
      const plan = await planDb.findPlanById(planId);
      if (!plan) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { plan };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async deletePlan(planId) {
    try {
      const isPlanExist = await planDb.planExistingCheck(planId);
      if (!isPlanExist) {
        throw new Error("PLAN_NOT_FOUND");
      }
      await planDb.deletePlanInDb(planId);
      return { message: "plans deleted successfully" };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
module.exports = new PlanService();
