const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");

class WebhookService {
  async stripeWebhooks(body, sig) {
    try {
      const event = stripeHelper.createWebhook(body, sig);
      console.log({ event_type: event.type });

      if (!event) return;
      switch (event.type) {
        case "invoice.created":
          const invoiceObj = event.data.object;
          const { payment_method, customer, status } =
            await stripeHelper.getPaymentIntentById(invoiceObj.payment_intent);
          const user = await userDb.findUserBystripeCustomerId(customer, [
            "id",
          ]);
          await paymentDb.addPaymentDataInDb({
            stripeCustomerId: invoiceObj.customer,
            userId: user.id,
            amount: invoiceObj.total / 100,
            paymentStatus: status,
            paymentType: common.PAYMENT_TYPE.SUBSCRIPTION,
            paymentMethod: {
              id: payment_method,
              type: "card",
            },
            invoiceId: invoiceObj.id,
            subscriptionId: invoiceObj.subscription,
            paymentIntentId: invoiceObj.payment_intent,
          });
          break;
        case "payment_intent.created":
          const intentObject = event.data.object;

          const userFound = await userDb.findUserBystripeCustomerId(
            intentObject.customer,
            ["id"]
          );
          await paymentDb.addPaymentDataInDb({
            stripeCustomerId: intentObject.customer,
            userId: userFound.id,
            amount: intentintentObjectObj.amount / 100,
            paymentStatus: intentObject.status,
            paymentType: common.PAYMENT_TYPE.ONETIME,
            paymentMethod: {
              id: payment_method,
              type: "card",
            },
            invoiceId: null,
            subscriptionId: null,
            paymentIntentId: intentObject.id,
          });
          break;
        case "invoice.voided":
        case "invoice.paid":
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
          const invoiceObject = event.data.object;
          await paymentDb.updatePaymentDataInDb(
            {
              paymentStatus: invoiceObject.status,
            },
            invoiceObject.payment_intent,
            invoiceObject.id
          );
          break;
        case "payment_intent.processing":
        case "payment_intent.payment_failed":
        case "payment_intent.cancelled":
        case "payment_intent.succeeded":
          const intentObj = event.data.object;
          await paymentDb.updatePaymentDataInDb(
            {
              paymentStatus: intentObj.status,
            },
            intentObj.id,
            intentObj.invoice
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
