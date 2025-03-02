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

  //plans related

  async findPriceByStripePriceId(priceId) {
    const price = await stripe.prices.retrieve(priceId);
    return price;
  },

  async createProductInStripe(planData) {
    const plan = await stripe.products.create({
      name: planData.name,
      description: planData.description,
    });
    return plan;
  },

  async createOnetimePriceInStripe(data, productId) {
    const price = await stripe.prices.create({
      currency: common.CURRENCY.USD,
      unit_amount: data.amount * 100,
      product: productId,
      metadata: { validity: `${data.validity} ${data.type}` },
    });
    return price;
  },
  async createRecurringPriceInStripe(data, productId) {
    const price = await stripe.prices.create({
      currency: common.CURRENCY.USD,
      unit_amount: data.amount * 100,
      product: productId,
      recurring: {
        interval: data.interval,
      },
    });
    return price;
  },

  async updateProductInStripe(productId, planData) {
    const plan = await stripe.products.update(productId, {
      name: planData.name,
      description: planData.description,
    });
    return plan;
  },
  deleteStripePrice(priceId) {
    stripe.prices.update(priceId, {
      active: false,
    });
  },
  deleteStripeplans(productId) {
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
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  },

  //Invoice realted

  async createInvoice(customer, collection_method) {
    const invoice = await stripe.invoices.create({
      customer,
      collection_method,
      currency: common.CURRENCY.INR,
    });
    return invoice;
  },

  async addplansToInvoice(customer, plans, invoice) {
    plans.map(async (price) => {
      await stripe.invoiceItems.create({
        customer,
        price,
        invoice,
      });
    });
  },

  async finalizeInvoice(invoice) {
    const finalizeInvoice = await stripe.invoices.finalizeInvoice(invoice);
    return finalizeInvoice;
  },

  //Subscription related

  async createSubscription(customer, priceId, paymentMethodId) {
    const subscription = await stripe.subscriptions.create({
      customer,
      items: [
        {
          price: priceId,
        },
      ],
      add_invoice_items: [{ price: "price_1QxS7QSJvKxGyYS6rHf1TfYr" }],
      default_payment_method: paymentMethodId,
      collection_method: common.COLLECTION_METHOD.AUTOMATIC,
    });
    return subscription;
  },

  async updateSubscription(subscriptionId, paymentMethodId) {
    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
    });
  },
  async cancelSubscription(subscriptionId, feedback) {
    await stripe.subscriptions.cancel(subscriptionId, {
      cancellation_details: {
        feedback,
      },
    });
  },

  async getSubscriptionByCustomerId(customerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });
    return subscriptions.data;
  },

  //Payment Intent Related
  async getPaymentIntentById(id) {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    return paymentIntent;
  },

  //Webhook related
  createWebhook(body, sig) {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.stripeConfig.WEBHOOK_SECRET_KEY
    );
    return event;
  },
};
