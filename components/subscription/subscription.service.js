const common = require("../../constants/common");
const paymentDb = require("../../dbUtils/paymentDb");
const promocodeDb = require("../../dbUtils/promocodeDb");
const userDb = require("../../dbUtils/userDb");
const helper = require("../../utils/helper");
const stripeHelper = require("../../utils/stripeHelper");

class SubscriptionService {
  async createSubscription(
    stripeCustomerId,
    priceId,
    paymentMethodId,
    promocode
  ) {
    try {
      const customerFound = await stripeHelper.findCustomerByCustomerId(
        stripeCustomerId
      );
      if (!customerFound) {
        throw new Error("USER_NOT_FOUND");
      }
      const priceDetails = await stripeHelper.findPriceByStripePriceId(priceId);
      if (priceDetails.type == "one_time") {
        throw new Error("INVALID_PRICE");
      }
      const paymentMethodExist = await stripeHelper.getPaymentMethodById(
        paymentMethodId
      );
      if (paymentMethodExist.customer != customerFound.id) {
        throw new Error("PAYMENT_METHOD_NOT_ATTACHED");
      }

      const checkPromocodeIsValid = await helper.checkPromocodeIsValid(
        promocode,
        priceDetails.unit_amount,
        priceDetails.currency
      );

      const subscription = await stripeHelper.createSubscription(
        stripeCustomerId,
        priceId,
        paymentMethodId,
        checkPromocodeIsValid.stripePromoCodeId
      );

      const userFound = await userDb.findUserByStripeCustomerId(
        subscription.customer
      );

      const newTransaction = {
        stripeCustomerId: subscription.customer,
        userId: userFound.id,
        amount: subscription.latest_invoice.subtotal / 100,
        currency: subscription.currency,
        paymentType: common.PAYMENT_TYPE.SUBSCRIPTION,
        paymentStatus:
          subscription.latest_invoice.amount_due === 0
            ? common.PAYMENT_STATUS.SUCCEEDED
            : common.PAYMENT_STATUS.PENDING,
        paymentMethod: {
          id: subscription.default_payment_method,
          type: "card",
        },
        invoiceId: subscription.latest_invoice.id,
        subscriptionId: subscription.id,
        paymentIntentId: null,
      };
      await paymentDb.addPaymentDataInDb(newTransaction);

      return subscription;
    } catch (err) {
      console.log({ "Error from create subscription": err });
      throw new Error(err.message);
    }
  }
  async updateSubscription(subscriptionId, paymentMethodId) {
    try {
      const subscription = await stripeHelper.updateSubscription(
        subscriptionId,
        paymentMethodId
      );
      return { message: "Subscription updated.", subscription };
    } catch (err) {
      console.log({ "Error from update subscription": err });
      throw new Error(err.message);
    }
  }
  async pauseSubscription(subscriptionId) {
    try {
      const checkSubscriptionExist =
        await stripeHelper.getSubscriptionBySubscriptionId(subscriptionId);

      if (checkSubscriptionExist.status != "active") {
        throw new Error("Subscription not available");
      }
      const subscription = await stripeHelper.pauseSubscription(subscriptionId);
      return {
        message: "Subscription Paused.",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          pause_collection: subscription.pause_collection,
        },
      };
    } catch (err) {
      console.log({ "Error from pause subscription": err });
      throw new Error(err.message);
    }
  }
  async resumeSubscription(subscriptionId) {
    try {
      const checkSubscriptionExist =
        await stripeHelper.getSubscriptionBySubscriptionId(subscriptionId);

      if (checkSubscriptionExist.status != "active") {
        throw new Error("Subscription not available");
      }
      const subscription = await stripeHelper.resumeSubscription(
        subscriptionId
      );
      return {
        message: "Subscription Resumed.",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          pause_collection: subscription.pause_collection,
        },
      };
    } catch (err) {
      console.log({ "Error from resume subscription": err });
      throw new Error(err.message);
    }
  }
  async cancelSubscription(subscriptionId, feedback) {
    try {
      const subscription = await stripeHelper.cancelSubscription(
        subscriptionId,
        feedback
      );
      return { message: "Subscription cancelled.", subscription };
    } catch (err) {
      console.log({ "Error from cancel subscription": err });
      throw new Error(err.message);
    }
  }
}
module.exports = new SubscriptionService();
