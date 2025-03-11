const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");
const _ = require("lodash");
class PaymentMethodService {
  async createPaymentMethod(type, paymentDetails, billingDetails, customerId) {
    try {
      const paymentMethod = await stripeHelper.createPaymentMethod(
        type,
        paymentDetails,
        billingDetails,
        customerId
      );
      const checkDefaultMethodExist = await userDb.checkDefaultMethodExist(
        customerId
      );

      if (!checkDefaultMethodExist) {
        await stripeHelper.setDefaultMethodOfCustomer(
          customerId,
          paymentMethod.id
        );

        await userDb.addCustomerDefaultMethodInDb(
          customerId,
          paymentMethod.id,
          paymentMethod.type
        );
      }
      await userDb.addPaymentMethodToCustomerDb(
        paymentMethod.id,
        paymentMethod.type,
        customerId
      );
      return { paymentMethod };
    } catch (err) {
      console.log({ "Error from create payment method": err });
      // if (err.type.includes("Stripe")) {
      //   stripeHelper.throwStripeErrors(err);
      // }
      throw new Error(err.message);
    }
  }
  async updatePaymentMethod(paymentMethodId, paymentDetails, billingDetails) {
    try {
      await stripeHelper.updatePaymentMethod(
        paymentMethodId,
        paymentDetails,
        billingDetails
      );
      return { status: true };
    } catch (err) {
      console.log({ "Error from update payment method": err });
      // if (err.type.includes("Stripe")) {
      //   stripeHelper.throwStripeErrors(err);
      // }
      throw new Error(err.message);
    }
  }
  async getAllPaymentMethodsOfCustomer(stripeCustomerId) {
    try {
      const paymentMethods = await stripeHelper.getAllPaymentMethodsByCutomerId(
        stripeCustomerId
      );

      const defaultMethod = await userDb.UserMdl.findOne({
        where: { stripeCustomerId },
        raw: true,
        attributes: ["defaultPaymentMethod"],
      });

      paymentMethods.data.map((method) => {
        if (method.id === defaultMethod.defaultPaymentMethod.id) {
          method.isDefault = true;
          return;
        }
        method.isDefault = false;
        return;
      });
      if (paymentMethods.data.length == 0) {
        throw new Error("PAYMENT_METHOD_NOT_FOUND");
      }
      return { paymentMethods: paymentMethods.data };
    } catch (err) {
      console.log({ "Error from get all payment method": err });
      // if (err.type.includes("Stripe")) {
      //   stripeHelper.throwStripeErrors(err);
      // }
      throw new Error(err.message);
    }
  }
  async setDefaultMethodOfCustomer(stripeCustomerId, paymentMethodId) {
    try {
      await stripeHelper.setDefaultMethodOfCustomer(
        stripeCustomerId,
        paymentMethodId
      );
      const paymentMethod = await stripeHelper.getPaymentMethodById(
        paymentMethodId
      );
      if (!paymentMethod) {
        throw new Error("METHOD_NOT_FOUND");
      }
      await userDb.addCustomerDefaultMethodInDb(
        stripeCustomerId,
        paymentMethodId,
        paymentMethod.type
      );
      return {
        status: true,
      };
    } catch (err) {
      console.log({ "Error from setting default payment method": err });
      // if (err.type.includes("Stripe")) {
      //   stripeHelper.throwStripeErrors(err);
      // }
      throw new Error(err.message);
    }
  }
  async deletePaymentMethodOfCustomer(stripeCustomerId, paymentMethodId) {
    try {
      const subscriptionsList = await stripeHelper.getSubscriptionByCustomerId(
        stripeCustomerId
      );
      const usedPaymentMethod = _.map(
        subscriptionsList,
        "default_payment_method" // get only payment methods id from array by lodash map method
      );
      if (usedPaymentMethod.includes(paymentMethodId)) {
        throw new Error("CANNOT_DELETE_METHOD");
      }
      let customerPaymentMethods =
        await stripeHelper.getAllPaymentMethodsByCutomerId(stripeCustomerId);
      customerPaymentMethods = _.map(customerPaymentMethods.data, "id"); // get only payment methods id from array by lodash map method
      if (!customerPaymentMethods.includes(paymentMethodId)) {
        throw new Error("PAYMENT_METHOD_NOT_ATTACHED");
      }
      await stripeHelper.detachMethodFromCustomer(paymentMethodId);
      await userDb.deletePaymentMethodFromCustomerDB(
        stripeCustomerId,
        paymentMethodId
      );
      return {
        status: true,
      };
    } catch (err) {
      console.log({ "Error from delete payment method": err });
      // if (err.type.includes("Stripe")) {
      //   await stripeHelper.throwStripeErrors(err);
      // }
      throw new Error(err.message);
    }
  }
}

module.exports = new PaymentMethodService();
