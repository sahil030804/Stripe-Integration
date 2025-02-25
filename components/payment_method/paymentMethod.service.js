const userDb = require("../../dbUtils/userDb");
const stripeHelper = require("../../utils/stripeHelper");
class PaymentMethodService {
  async createPaymentMethod(type, paymentDetails, billingDetails, customerId) {
    try {
      const paymentMethod = await stripeHelper.createPaymentMethod(
        type,
        paymentDetails,
        billingDetails,
        customerId
      );

      await userDb.addPaymentMethodToCustomerDb(
        paymentMethod.id,
        paymentMethod.type,
        customerId
      );
      return { status: true };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getAllPaymentMethodsOfCustomer(stripeCustomerId) {
    try {
      const paymentMethods = await stripeHelper.getAllPaymentMethodsById(
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

      return { paymentMethods: paymentMethods.data };
    } catch (err) {
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
      throw new Error(err.message);
    }
  }
  async deletePaymentMethodOfCustomer(stripeCustomerId, paymentMethodId) {
    try {
      await stripeHelper.detachMethodFromCustomer(paymentMethodId);
      await userDb.deletePaymentMethodFromCustomerDB(
        stripeCustomerId,
        paymentMethodId
      );
      return {
        status: true,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PaymentMethodService();
