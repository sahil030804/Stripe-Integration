const config = require("../config/config");
const common = require("../constants/common");
const stripe = require("stripe")(config.stripeConfig.STRIPE_SECRET_KEY);

module.exports = {
  //customer related
  async createStripeCustomer(customerData) {
    const user = await stripe.customers.create({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone_number,
    });
    return user.id;
  },

  async createPaymentMethod(type, paymentDetails, billing_details, customerId) {
    const paymentMethod = await stripe.paymentMethods.create({
      type,
      card: paymentDetails,
      billing_details,
    });
    await this.attachMethodToCustomer(customerId, paymentMethod.id);
    return paymentMethod;
  },

  //Product related
  async createProductPriceInStripe(productData) {
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
    });
    const price = await stripe.prices.create({
      currency: common.currency.USD,
      unit_amount: productData.price * 100,
      product: product.id,
    });
    return price;
  },

  async updateProductPriceInStripe(priceId, productId, productData) {
    const product = await stripe.products.update(productId, {
      name: productData.name,
      description: productData.description,
    });

    const price = await stripe.prices.create({
      unit_amount: productData.price * 100,
      currency: common.currency.USD,
      product: product.id,
    });

    this.deleteStripePrice(priceId);
    return price;
  },
  deleteStripePrice(priceId) {
    stripe.prices.update(priceId, {
      active: false,
    });
  },
  deleteStripeProduct(productId) {
    stripe.products.del(productId);
  },

  //Payment method related
  async getAllPaymentMethodsById(stripeCustomerId) {
    const methods = await stripe.customers.listPaymentMethods(stripeCustomerId);
    return methods;
  },

  async attachMethodToCustomer(customer, paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, { customer });
  },

  async detachMethodFromCustomer(paymentMethodId) {
    await stripe.paymentMethods.detach(paymentMethodId);
  },

  async getPaymentMethodById(id) {
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    return paymentMethod;
  },

  async setDefaultMethodOfCustomer(customer, paymentMethodId) {
    await stripe.customers.update(customer, {
      invoice_settings: { default_payment_method: paymentMethodId }, //this set default method for invoice auto pay
    });
  },
};
