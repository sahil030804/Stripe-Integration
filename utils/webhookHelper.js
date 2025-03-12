const common = require("../constants/common");
const paymentDb = require("../dbUtils/paymentDb");
const userDb = require("../dbUtils/userDb");
const helper = require("./helper");
const stripeHelper = require("./stripeHelper");

module.exports = {
  async addPaymentDataInDb(intentObj) {
    const userFound = await userDb.findUserByStripeCustomerId(
      intentObj.customer
    );
    if (!userFound) {
      throw new Error("USER_NOT_FOUND");
    }
    if (intentObj.invoice && intentObj.description) {
      const invoiceExist = await paymentDb.checkExistingInvoice(
        intentObj.invoice
      );
      if (invoiceExist) {
        await paymentDb.updatePaymentDataInDb(
          {
            paymentIntentId: intentObj.id,
            paymentStatus: intentObj.status,
          },
          intentObj.invoice
        );

        return;
      }
      const invoice = await stripeHelper.getInvoiceById(intentObj.invoice);

      const newTransaction = {
        stripeCustomerId: intentObj.customer,
        userId: userFound.id,
        amount: intentObj.amount / 100,
        currency: intentObj.currency,
        paymentType: common.PAYMENT_TYPE.SUBSCRIPTION,
        paymentStatus: intentObj.status,
        paymentMethod: {
          id: intentObj.payment_method,
          type: "card",
        },
        invoiceId: intentObj.invoice,
        subscriptionId: invoice.subscription,
        paymentIntentId: intentObj.id,
      };
      await paymentDb.addPaymentDataInDb(newTransaction);
    }

    const currentStatus = await paymentDb.getPaymentStatusFromDb(
      intentObj.invoice ? intentObj.invoice : intentObj.id
    );

    if (currentStatus === "succeeded") {
      return;
    }

    if (currentStatus != "succeeded" || intentObj.status === "succeeded") {
      await paymentDb.updatePaymentDataInDb(
        {
          paymentIntentId: intentObj.id,
          paymentStatus: intentObj.status,
        },
        intentObj.invoice ? intentObj.invoice : intentObj.id
      );
    }
  },
};
