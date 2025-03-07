const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");
const _ = require("lodash");

class PaymentIntentService {
  async createPaymentIntent(priceId, customerId) {
    try {
      const priceFound = await stripeHelper.findPriceByStripePriceId(priceId);
      if (!priceFound.active) {
        throw new Error("PRICE_DELETED");
      }
      if (priceFound.type == "recurring") {
        throw new Error("INVALID_PRICE");
      }
      const paymentIntent = await stripeHelper.createPaymentIntent(
        priceFound.unit_amount / 100,
        priceFound.currency,
        priceId,
        customerId
      );
      const userFound = await userDb.findUserByStripeCustomerId(
        paymentIntent.customer
      );
      await paymentDb.addPaymentDataInDb({
        stripeCustomerId: paymentIntent.customer,
        userId: userFound.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentStatus: common.PAYMENT_STATUS.PENDING,
        paymentType: common.PAYMENT_TYPE.ONETIME,
        invoiceId: null,
        subscriptionId: null,
        paymentIntentId: paymentIntent.id,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        // paymentIntent,
      };
    } catch (err) {
      console.log(`Error from create payment intent`, err);
      throw new Error(err.message);
    }
  }
  async confirmPaymentIntent(
    paymentIntentId,
    paymentMethodId,
    stripeCustomerId
  ) {
    try {
      let customerPaymentMethods =
        await stripeHelper.getAllPaymentMethodsByCutomerId(stripeCustomerId);
      customerPaymentMethods = _.map(customerPaymentMethods.data, "id"); // get only payment methods id from array by lodash map method
      if (!customerPaymentMethods.includes(paymentMethodId)) {
        throw new Error("PAYMENT_METHOD_NOT_ATTACHED");
      }
      const result = await stripeHelper.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId
      );
      await paymentDb.updatePaymentDataInDb(
        {
          paymentMethod: {
            id: result.payment_method ? result.payment_method : null,
            type: "card",
          },
          paymentStatus: common.PAYMENT_STATUS.PENDING,
        },
        result.id
      );
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PaymentIntentService();
