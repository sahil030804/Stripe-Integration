const stripeHelper = require("../../utils/stripeHelper");
const webhookHelper = require("../../utils/webhookHelper");
const _ = require("lodash");

class WebhookService {
  async stripeWebhooks(body, sig) {
    try {
      const event = stripeHelper.createWebhook(body, sig);
      console.log({ event_type: event.type });

      if (!event) return;

      let intentObj, subscriptionObj;

      switch (event.type) {
        case "payment_intent.payment_failed":
        case "payment_intent.cancelled":
        case "payment_intent.succeeded":
          intentObj = event.data.object;
          await webhookHelper.addPaymentDataInDb(intentObj);
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
