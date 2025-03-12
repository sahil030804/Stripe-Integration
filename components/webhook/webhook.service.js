const stripeHelper = require("../../utils/stripeHelper");
const webhookHelper = require("../../utils/webhookHelper");
const queueHelper = require("../../utils/queueHelper");

const _ = require("lodash");
const promocodeDb = require("../../dbUtils/promocodeDb");

class WebhookService {
  async stripeWebhooks(body, sig) {
    try {
      const event = stripeHelper.createWebhook(body, sig);
      console.log({ event_type: event.type });

      if (!event) return;

      let intentObj, subscriptionObj, promocodeObj;

      switch (event.type) {
        case "payment_intent.payment_failed":
        case "payment_intent.cancelled":
        case "payment_intent.succeeded":
          intentObj = event.data.object;
          await queueHelper.queues.paymentProcessJob(intentObj);
          break;
        case "customer.subscription.updated":
          subscriptionObj = event.data.object;

          if (subscriptionObj.default_payment_method == null) {
            const { invoice_settings } =
              await stripeHelper.findCustomerByCustomerId(
                subscriptionObj.customer
              );

            await stripeHelper.updateSubscription(
              subscriptionObj.id,
              invoice_settings.default_payment_method
            );
          }
          break;
        case "promotion_code.updated":
          promocodeObj = event.data.object;
          await promocodeDb.updatePromocodeInDb(
            {
              stripePromoCodeId: promocodeObj.id,
            },
            {
              times_redeemed: promocodeObj.times_redeemed,
            }
          );
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Webhook Error:", err);
      throw new Error(err.message);
    }
  }
}

module.exports = new WebhookService();
