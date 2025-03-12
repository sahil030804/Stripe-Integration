const { Op } = require("sequelize");
const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const promocodeDb = require("../../dbUtils/promocodeDb");
const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");
const _ = require("lodash");
const helper = require("../../utils/helper");

class PaymentIntentService {
  async createPaymentIntent(priceId, promocodeId, customerId) {
    try {
      const priceFound = await stripeHelper.findPriceByStripePriceId(priceId);
      if (!priceFound.active) {
        throw new Error("PRICE_DELETED");
      }
      if (priceFound.type == "recurring") {
        throw new Error("INVALID_PRICE");
      }

      let totalAmount = priceFound.unit_amount / 100;

      if (promocodeId) {
        const checkPromocodeIsValid = await helper.checkPromocodeIsValid(
          promocodeId,
          priceFound.unit_amount,
          priceFound.currency
        );

        if (checkPromocodeIsValid.amount_off) {
          totalAmount -= checkPromocodeIsValid.amount_off;
        }

        if (checkPromocodeIsValid.percent_off) {
          totalAmount -=
            (totalAmount * checkPromocodeIsValid.percent_off) / 100;
        }
        totalAmount = Math.max(0, totalAmount);
      }
      const paymentIntent = await stripeHelper.createPaymentIntent(
        totalAmount,
        priceFound.currency,
        priceId,
        customerId
      );
      if (!paymentIntent) throw new Error("PAYMENT_INTENT_NOT_CREATED");
      const userFound = await userDb.findUserByStripeCustomerId(
        paymentIntent.customer
      );
      if (!userFound) throw new Error("USER_NOT_FOUND");

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
      if (!result) throw new Error("PAYMENT_INTENT_NOT_CONFIRMED");
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
