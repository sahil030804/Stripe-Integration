const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const helper = require("../../utils/helper");
const stripeHelper = require("../../utils/stripeHelper");

class PurchaseService {
  async checkPaymentStatus(id) {
    try {
      const paymentStatus = await paymentDb.getPaymentStatusFromDb(id);
      return paymentStatus;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getActiveSubscriptionOfUser(customerId) {
    try {
      const subscriptions = await stripeHelper.getSubscriptionByCustomerId(
        customerId
      );
      if (subscriptions.length < 1) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { subscriptions };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getActiveOnetimePlanOfUser(customerId) {
    try {
      const plans = await paymentDb.getActivePlanOfUser(
        customerId,
        common.PLAN_TYPE.ONETIME
      );
      const onetimePlans = await Promise.all(
        plans.map(async (plan) => {
          const { metadata } = await stripeHelper.getPaymentIntentById(
            plan.paymentIntentId
          );

          if (metadata.planEndDate > new Date().toISOString()) {
            return {
              planName: metadata.planName,
              amount: plan.amount,
              currency: plan.currency,
              expiryDate: new Date(metadata.planEndDate).toISOString(),
            };
          }
        })
      );
      if (onetimePlans.length < 1) {
        throw new Error("PLAN_NOT_FOUND");
      }
      return { onetimePlans };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getHistoryOfUserPurchase(customerId) {
    try {
      const history = await paymentDb.purchaseHistoryOfCustomer(customerId, [
        "amount",
        "paymentType",
        "paymentStatus",
        "invoiceId",
        "subscriptionId",
        "paymentIntentId",
      ]);

      await helper.formatTransactionData(history);
      if (history.length < 1) {
        throw new Error("PLAN_NOT_FOUND");
      }

      return { history };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PurchaseService();
