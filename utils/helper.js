const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const refreshTokenDb = require("../dbUtils/refreshTokenDb");
const stripeHelper = require("./stripeHelper");
const promocodeDb = require("../dbUtils/promocodeDb");

class Helper {
  async generateAccessAndRefreshToken(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      config.jwtConfig.ACCESS_TOKEN_KEY,
      { expiresIn: `${config.jwtConfig.ACCESS_TOKEN_EXPIRY}m` }
    );

    const refreshToken = uuidv4();

    await refreshTokenDb.addRefreshTokenInDb(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  getTokenFromHeader(req) {
    let token;
    const authToken = req.headers["authorization"];
    if (authToken && authToken.startsWith("Bearer")) {
      token = authToken.split(" ")[1];
    }
    return token;
  }

  async convertDateToTimestamp(date) {
    const timestamp = Date.parse(date) / 1000;
    return timestamp;
  }

  async formatTransactionData(history) {
    return Promise.all(
      history.map(async (record) => {
        if (record.invoiceId !== null && record.subscriptionId !== null) {
          const subscription =
            await stripeHelper.getSubscriptionBySubscriptionId(
              record.subscriptionId
            );
          const invoice = await stripeHelper.getInvoiceById(record.invoiceId);
          const startDate = new Date(invoice.created * 1000);
          let endDate = new Date(startDate);

          const unit = subscription.plan.interval;
          const value = subscription.plan.interval_count;

          switch (unit.toLowerCase()) {
            case "week":
              endDate.setDate(endDate.getDate() + value * 7);
              break;
            case "month":
              endDate.setMonth(endDate.getMonth() + value);
              break;
            case "year":
              endDate.setFullYear(endDate.getFullYear() + value);
              break;
            default:
              endDate.setDate(endDate.getDate() + 30);
              break;
          }

          record.planName = subscription.metadata.planName;
          record.currency = subscription.currency.toUpperCase();
          record.status = subscription.status;
          record.startDate = startDate.toISOString();
          record.nextDueDate = endDate.toISOString();
          record.planEndDate = subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : new Date(subscription.canceled_at * 1000).toISOString();
          record.invoiceUrl = invoice.hosted_invoice_url;
        } else {
          const paymentIntent = await stripeHelper.getPaymentIntentById(
            record.paymentIntentId
          );

          record.planName =
            paymentIntent.metadata.planName || "One-time purchase";
          record.amount = paymentIntent.amount / 100;
          record.currency = paymentIntent.currency.toUpperCase();
          record.startDate = new Date(
            paymentIntent.created * 1000
          ).toISOString();
          record.nextDueDate = null;
          record.planEndDate = new Date(
            paymentIntent.metadata.planEndDate
          ).toISOString();
          record.receipt_url = paymentIntent.latest_charge.receipt_url;
        }
        delete record.stripeCustomerId;
        delete record.userId;
        delete record.paymentMethod;
        return record;
      })
    );
  }

  async checkPromocodeIsValid(promocode, amount, currency) {
    const promocodeObj = await promocodeDb.findPromocodeByFilter({
      stripePromoCodeId: promocode,
    });

    console.log({ promocodeObj });

    if (!promocodeObj) {
      throw new Error("CODE_NOT_FOUND");
    }

    if (promocodeObj.currency !== currency) {
      throw new Error("INVALID_CURRENCY");
    }

    if (amount < promocodeObj.minimum_amount) {
      throw new Error("MINIMUM_AMOUNT_NOT_MET");
    }

    return promocodeObj;
  }
}
module.exports = new Helper();
