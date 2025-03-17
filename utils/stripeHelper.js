const config = require('../config/config');
const common = require('../constants/common');
const stripe = require('stripe')(config.stripeConfig.STRIPE_SECRET_KEY);

module.exports = {
  // customer related
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

  async updatePaymentMethod(paymentMethodId, paymentDetails, billing_details) {
    const paymentMethod = await stripe.paymentMethods.update(paymentMethodId, {
      card: paymentDetails,
      billing_details,
    });
    return paymentMethod;
  },

  async findCustomerByCustomerId(customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  },

  // plans related

  async findPriceByStripePriceId(priceId) {
    const price = await stripe.prices.retrieve(priceId);
    return price;
  },

  async findProductByStripeProductId(productId) {
    const product = await stripe.products.retrieve(productId);
    return product;
  },

  async createProductInStripe(planData) {
    const plan = await stripe.products.create({
      name: planData.name,
      description: planData.description,
    });
    return plan;
  },

  async createOnetimePriceInStripe(data, productId) {
    const { name } = await this.findProductByStripeProductId(productId);
    const price = await stripe.prices.create({
      currency: common.CURRENCY.USD,
      unit_amount: data.amount * 100,
      product: productId,
      metadata: { validity: `${data.validity} ${data.type}`, planName: name },
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

  deleteStripeProduct(productId) {
    stripe.products.del(productId);
  },

  // Payment method related

  async getAllPaymentMethodsByCutomerId(stripeCustomerId) {
    const methods = await stripe.customers.listPaymentMethods(
      stripeCustomerId,
      { limit: 20 }
    );
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

  // Invoice realted

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

  async getInvoiceById(invoiceId) {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  },

  // Subscription related

  async createSubscription(customer, priceId, paymentMethodId, promocode) {
    const { product } = await this.findPriceByStripePriceId(priceId);
    const productData = await this.findProductByStripeProductId(product);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // temporary set 1 year bydefault
    const subscription = await stripe.subscriptions.create({
      customer,
      items: [
        {
          price: priceId,
        },
      ],
      cancel_at: endDate,
      metadata: {
        planName: productData.name,
        description: productData.description,
        paymentMethodId,
      },
      expand: ['latest_invoice'],
      default_payment_method: paymentMethodId,
      collection_method: common.COLLECTION_METHOD.AUTOMATIC,
      promotion_code: promocode,
    });
    return subscription;
  },

  async updateSubscription(subscriptionId, paymentMethodId) {
    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
      metadata: {
        paymentMethodId,
      },
    });
  },

  async pauseSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: common.COLLECTION_BEHAVIOUR.UNCOLLECTIBLE,
      },
    });
    return subscription;
  },

  async resumeSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
      // billing_cycle_anchor: "now",
      // proration_behavior: "create_prorations",
    });
    return subscription;
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
      status: 'active',
    });
    return subscriptions.data;
  },

  async getSubscriptionBySubscriptionId(subscriptionId) {
    const subscriptions = await stripe.subscriptions.retrieve(subscriptionId);
    return subscriptions;
  },

  // payment intent related
  async createPaymentIntent(amount, currency, priceId, customer) {
    const { metadata } = await this.findPriceByStripePriceId(priceId);

    const endDate = new Date();

    const validity = metadata.validity;
    const [number, unit] = validity.split(' ');
    const value = parseInt(number, 10);

    switch (unit.toLowerCase()) {
      case 'week':
        endDate.setDate(endDate.getDate() + value * 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + value);
        break;
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + value);
        break;
      default:
        endDate.setDate(endDate.getDate() + 30);
        break;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer,
      description: metadata.planName,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        planEndDate: endDate.toISOString(),
        priceId,
      },
    });

    return paymentIntent;
  },

  async confirmPaymentIntent(id, paymentMethodId) {
    const result = await stripe.paymentIntents.confirm(id, {
      payment_method: paymentMethodId,
      return_url: 'https://www.example.com',
    });
    return result;
  },

  async getPaymentIntentById(id) {
    const paymentIntent = await stripe.paymentIntents.retrieve(id, {
      expand: ['latest_charge'],
    });
    return paymentIntent;
  },

  // Promocode related

  async createCoupen(couponData) {
    const couponObj = {
      id: couponData.name,
      name: couponData.name,
      duration: couponData.durationType,
      duration_in_months: couponData.duration_in_months,
      currency: couponData.currency,
    };
    if (couponData.amount_off) {
      couponObj.amount_off = parseFloat(couponData.amount_off * 100);
    }
    if (couponData.percent_off) {
      couponObj.percent_off = parseFloat(couponData.percent_off);
    }

    const coupon = await stripe.coupons.create(couponObj);
    return coupon;
  },

  async updateCoupon(couponId, updateObj) {
    const updatedCoupon = await stripe.coupons.update(couponId, updateObj);
    return updatedCoupon;
  },

  async deleteCoupon(couponId) {
    await stripe.coupons.del(couponId);
  },

  async createPromocode(promocodeData, stripeCouponId) {
    const promocodeObj = {
      coupon: stripeCouponId,
      code: promocodeData.code,
      expires_at: promocodeData.expires_at,
      max_redemptions: promocodeData.max_redemptions || null,
    };
    if (promocodeData.minimum_amount && promocodeData.minimum_amount_currency) {
      promocodeObj.restrictions = {
        minimum_amount: promocodeData.minimum_amount,
        minimum_amount_currency: promocodeData.minimum_amount_currency,
      };
    }
    const promocode = await stripe.promotionCodes.create(promocodeObj);
    return promocode;
  },

  // async updatePromoCode(promoCodeId, updateObj) {
  //   const updatedPromocode = await stripe.promotionCodes.update(promoCodeId, {
  //     active: updateObj.active,
  //   });
  //   return updatedPromocode;
  // },

  async deletePromoCode(promoCodeId) {
    await stripe.promotionCodes.update(promoCodeId, {
      active: 'false',
    });
  },

  // Webhook related
  createWebhook(body, sig) {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.stripeConfig.WEBHOOK_SECRET_KEY
    );
    return event;
  },

  // for erros
  async throwStripeErrors(err) {
    throw {
      status: err.raw.statusCode,
      code: err.raw.code ? err.raw.code : err.raw.type,
      message: err.raw.message,
    };
  },
};
