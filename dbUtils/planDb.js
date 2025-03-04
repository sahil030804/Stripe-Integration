const { Op } = require("sequelize");
const config = require("../config/config");
const common = require("../constants/common");
const { Plan } = require("../db/models");

class PlanDb extends Plan {
  async planExistingCheck(id) {
    const plan = await this.findPlanById(id);
    if (!plan) {
      return false;
    }
    return true;
  }

  async countByFilter(query) {
    const existingPlan = await Plan.findAndCountAll(query);
    return existingPlan.count;
  }

  async findPlanById(id) {
    const plan = await Plan.findByPk(id, { raw: true });
    return plan;
  }

  async addPlanInDb(planData, onetime, subscription) {
    const plan = await Plan.create({
      name: planData.name,
      description: planData.description,
      currency: planData.currency,
      stripeProductId: planData.stripeProductId,
      stripePricesId: { onetime, subscription },
    });

    return plan.toJSON();
  }

  async updatePlanInDb(planData, onetime, subscription, planId) {
    const plan = await Plan.update(
      {
        name: planData.name,
        description: planData.description,
        currency: planData.currency,
        stripePricesId: { onetime, subscription },
        stripeProductId: planData.stripeProductId,
      },
      {
        where: { id: planId },
        returning: true, // it returns new updated data with count
        plain: true,
      }
    );
    return plan[1]; //it return only new data
  }

  async deletePlanInDb(id) {
    await Plan.destroy({ where: { id } });
  }

  async getAllPlansFromDb(page, limit) {
    const plans = await Plan.findAll({
      limit,
      offset: (page - 1) * limit,
      order: [["id", "DESC"]],
      raw: true,
    });
    return plans;
  }

  async getAllPlansByType(planType) {
    const plans = await Plan.findAll({
      where: {
        stripePricesId: {
          [Op.contains]: { [planType]: [{}] }, //check if key exist in table and also has atleast one object
        },
      },
      raw: true,
    });

    return plans.map((plan) => {
      return {
        id: plan.id,
        stripeProductId: plan.stripeProductId,
        name: plan.name,
        [planType]: plan.stripePricesId[planType],
        currency: plan.currency,
      };
    });
  }
}

module.exports = new PlanDb();
module.exports.PlanMdl = Plan;
