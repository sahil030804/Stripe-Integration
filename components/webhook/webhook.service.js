const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");

class WebhookService {
  async stripeWebhooks(body, sig) {
    try {
      const event = stripeHelper.createWebhook(body, sig);
      console.log({ event_type: event?.type });

      if (!event) return;

      let intentObj, invoiceObj, userFound;

      switch (event.type) {
        case "invoice.created":
          invoiceObj = event.data.object;
          const subscriptionExistCount = await paymentDb.checkSubscriptionExist(
            invoiceObj.subscription
          );

          console.log({ count: subscriptionExistCount });

          if (subscriptionExistCount === 0) {
            userFound = await userDb.findUserByStripeCustomerId(
              invoiceObj.customer,
              ["id"]
            );

            if (!userFound) {
              throw new Error("USER_NOT_FOUND");
            }

            const { payment_method, status } =
              await stripeHelper.getPaymentIntentById(
                invoiceObj.payment_intent
              );

            const existingPayment = await paymentDb.getPaymentStatusFromDb(
              invoiceObj.payment_intent
            );
            if (!existingPayment) {
              await paymentDb.addPaymentDataInDb({
                stripeCustomerId: invoiceObj.customer,
                userId: userFound.id,
                amount: invoiceObj.total / 100,
                currency: invoiceObj.currency,
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
            }
          }
          break;

        case "payment_intent.created":
          intentObj = event.data.object;
          console.log({ intentcreate: intentObj });

          userFound = await userDb.findUserByStripeCustomerId(
            intentObj.customer,
            ["id"]
          );
          if (!userFound) {
            throw new Error("USER_NOT_FOUND");
          }

          console.log({
            status:
              intentObj.invoice !== null && intentObj.description !== null,
          });

          const existingPaymentIntent = await paymentDb.getPaymentStatusFromDb(
            intentObj.id
          );
          if (existingPaymentIntent) {
            break;
          }

          if (intentObj.invoice && intentObj.description) {
            const { subscription } = await stripeHelper.findInvoiceById(
              intentObj.invoice
            );
            await paymentDb.addPaymentDataInDb({
              stripeCustomerId: intentObj.customer,
              userId: userFound.id,
              amount: intentObj.amount / 100,
              currency: intentObj.currency,
              paymentStatus: intentObj.status,
              paymentType: common.PAYMENT_TYPE.SUBSCRIPTION,
              invoiceId: intentObj.invoice,
              subscriptionId: subscription,
              paymentIntentId: intentObj.id,
            });
          } else {
            await paymentDb.addPaymentDataInDb({
              stripeCustomerId: intentObj.customer,
              userId: userFound.id,
              amount: intentObj.amount / 100,
              currency: intentObj.currency,
              paymentStatus: intentObj.status,
              paymentType: common.PAYMENT_TYPE.ONETIME,
              invoiceId: null,
              subscriptionId: null,
              paymentIntentId: intentObj.id,
            });
          }
          break;

        case "payment_intent.payment_failed":
        case "payment_intent.cancelled":
        case "payment_intent.succeeded":
          intentObj = event.data.object;
          console.log({ intentObj });

          const currentStatus = await paymentDb.getPaymentStatusFromDb(
            intentObj.id
          );

          if (currentStatus !== "succeeded") {
            await paymentDb.updatePaymentDataInDb(
              {
                paymentMethod: {
                  id: intentObj.payment_method,
                  type: "card",
                },
                paymentStatus: intentObj.status,
              },
              intentObj.id
            );
          }
          break;

        default:
          console.log("Unhandled event type:", event.type);
          break;
      }
    } catch (err) {
      console.error("Webhook Error:", err);
      throw new Error(err.message);
    }
  }
}

module.exports = new WebhookService();
