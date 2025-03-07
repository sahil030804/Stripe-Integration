const Joi = require("joi");

module.exports = {
  createSubscription: {
    body: Joi.object({
      priceId: Joi.string().required(),
      paymentMethodId: Joi.string().required(),
    }),
  },
  updateSubscription: {
    body: Joi.object({
      subscriptionId: Joi.string().required(),
      paymentMethodId: Joi.string().required(),
    }),
  },
  cancelSubscription: {
    body: Joi.object({
      subscriptionId: Joi.string().required(),
      feedback: Joi.string().required(),
    }),
  },
};
