const common = require("../../constants/common");
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
      await Promise.all(
        history.map(async (record) => {
          if (record.invoiceId !== null && record.subscriptionId !== null) {
            const subscription =
              await stripeHelper.getSubscriptionBySubscriptionId(
                record.subscriptionId
              );
            const invoice = await stripeHelper.getInvoiceById(record.invoiceId);

            const startDate = new Date(
              invoice.status_transitions.paid_at * 1000
            );

            let endDate = new Date(startDate);

            const unit = subscription.plan.interval;
            const value = subscription.plan.interval_count;

            switch (unit.toLowerCase()) {
              case "week":
                endDate.setDate(endDate.getDate() + value * 7);
                break;
              case "month":
                endDate.setMonth(endDate.getMonth() + value);
                break;
              case "year":
                endDate.setFullYear(endDate.getFullYear() + value);
                break;
              default:
                endDate.setDate(endDate.getDate() + 30);
                break;
            }

            record.planName = subscription.metadata.planName;
            record.amount = invoice.amount_due / 100;
            record.currency = subscription.currency.toUpperCase();
            record.status = subscription.status;
            record.startDate = startDate.toISOString();
            record.nextDueDate = endDate.toISOString();
            record.planEndDate = subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : new Date(subscription.canceled_at * 1000).toISOString();
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
            ).toISOString();
            record.nextDueDate = null;
            record.planEndDate = new Date(
              paymentIntent.metadata.planEndDate
            ).toISOString();
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
