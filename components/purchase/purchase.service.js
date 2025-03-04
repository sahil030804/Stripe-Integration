const paymentDb = require("../../dbUtils/paymentDb");
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
      const plans = await paymentDb.getActivePlanOfUser(customerId, "onetime");
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
              expiryDate: new Date(metadata.planEndDate).toDateString(),
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
      await Promise.all(
        history.map(async (record) => {
          if (record.invoiceId !== null && record.subscriptionId !== null) {
            const subscription =
              await stripeHelper.getSubscriptionBySubscriptionId(
                record.subscriptionId
              );
            const invoice = await stripeHelper.findInvoiceById(
              record.invoiceId
            );

            record.planName = subscription.metadata.planName;
            record.amount = subscription.plan.amount / 100;
            record.currency = subscription.currency.toUpperCase();
            record.status = subscription.status;
            record.startDate = new Date(
              subscription.billing_cycle_anchor * 1000
            ).toDateString();
            record.nextDueDate = new Date(
              subscription.current_period_end * 1000
            ).toDateString();
            record.invoiceUrl = invoice.hosted_invoice_url;
          } else {
            const paymentIntent = await stripeHelper.getPaymentIntentById(
              record.paymentIntentId
            );
            record.planName =
              paymentIntent.metadata.planName || "One-time purchase";
            record.amount = paymentIntent.amount / 100;
            record.currency = paymentIntent.currency.toUpperCase();
            record.startDate = new Date(
              paymentIntent.created * 1000
            ).toDateString();
            record.nextDueDate = null;
            record.planEndDate = new Date(
              paymentIntent.metadata.planEndDate
            ).toDateString();
          }
        })
      );
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
