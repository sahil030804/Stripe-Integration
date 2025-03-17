const { Op } = require('sequelize');
const common = require('../../constants/common');
const planDb = require('../../dbUtils/planDb');
const stripeHelper = require('../../utils/stripeHelper');

class PlanService {
  async createPlan(planData) {
    try {
      const checkPlanExistWithName = await planDb.countByQuery({
        where: {
          name: { [Op.iLike]: planData.name },
        },
      });
      if (checkPlanExistWithName > 0) {
        throw new Error('PLAN_ALREADY_EXIST');
      }
      const stripeProduct = await stripeHelper.createProductInStripe(planData);
      let onetime;
      if (planData.onetime && planData.onetime.length > 0) {
        onetime = await Promise.all(
          planData.onetime.map(async (data) => {
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
      } else {
        onetime = [];
      }

      let subscription;
      if (planData.subscription && planData.subscription.length > 0) {
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
      } else {
        subscription = [];
      }
      planData.stripeProductId = stripeProduct.id;
      const plan = await planDb.addPlanInDb(planData, onetime, subscription);
      return { plan };
    } catch (err) {
      console.log({ 'Error from create plan': err });
      throw new Error(err.message);
    }
  }
  async updatePlan(planData, planId) {
    try {
      const existingPlan = await planDb.findPlanById(planId);
      if (!existingPlan) {
        throw new Error('PLAN_NOT_FOUND');
      }
      const checkPlanExistWithName = await planDb.countByQuery({
        where: {
          [Op.and]: [
            { name: { [Op.iLike]: planData.name } },
            { id: { [Op.ne]: planId } },
          ],
        },
      });
      if (checkPlanExistWithName > 0) {
        throw new Error('PLAN_ALREADY_EXIST');
      }
      existingPlan.stripePricesId.onetime.map((price) => {
        stripeHelper.deleteStripePrice(price.priceId);
      });
      existingPlan.stripePricesId.subscription.map((price) => {
        stripeHelper.deleteStripePrice(price.priceId);
      });
      await stripeHelper.updateProductInStripe(
        existingPlan.stripeProductId,
        planData
      );
      let onetime;
      if (planData.onetime && planData.onetime.length > 0) {
        onetime = await Promise.all(
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
      } else {
        onetime = [];
      }

      let subscription;
      if (planData.subscription && planData.subscription.length > 0) {
        subscription = await Promise.all(
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
      } else {
        subscription = [];
      }

      const updatedplans = await planDb.updatePlanInDb(
        planData,
        onetime,
        subscription,
        planId
      );

      return { updatedplans };
    } catch (err) {
      console.log({ 'Error from update plan': err });
      throw new Error(err.message);
    }
  }

  async getAllPlans(page, limit) {
    try {
      const plans = await planDb.getAllPlansFromDb(page, limit);
      if (plans.length == 0) {
        throw new Error('PLAN_NOT_FOUND');
      }

      return { plans };
    } catch (err) {
      console.log({ 'Error from get all plans': err });
      throw new Error(err.message);
    }
  }
  async getOnetimePlans() {
    try {
      const oneTimePlans = await planDb.getAllPlansByType(
        common.PLAN_TYPE.ONETIME
      );

      if (!oneTimePlans) {
        throw new Error('PLAN_NOT_FOUND');
      }
      return { oneTimePlans };
    } catch (err) {
      console.log({
        'Error from get active onetime plan': err,
      });
      throw new Error(err.message);
    }
  }
  async getSubscriptionPlans() {
    try {
      const plans = await planDb.getAllPlansByType(
        common.PLAN_TYPE.SUBSCRIPTION
      );

      if (!plans) {
        throw new Error('PLAN_NOT_FOUND');
      }
      return { plans };
    } catch (err) {
      console.log({
        'Error from get active subscription plan': err,
      });
      throw new Error(err.message);
    }
  }
  async getSinglePlan(planId) {
    try {
      const plan = await planDb.findPlanById(planId);
      if (!plan) {
        throw new Error('PLAN_NOT_FOUND');
      }
      return { plan };
    } catch (err) {
      console.log({ 'Error from get single plan': err });
      throw new Error(err.message);
    }
  }
  async deletePlan(planId) {
    try {
      const isPlanExist = await planDb.planExistingCheck(planId);
      if (!isPlanExist) {
        throw new Error('PLAN_NOT_FOUND');
      }
      await planDb.deletePlanInDb(planId);
      return { message: 'plans deleted successfully' };
    } catch (err) {
      console.log({
        'Error from delete plan': err,
      });
      throw new Error(err.message);
    }
  }
}
module.exports = new PlanService();
