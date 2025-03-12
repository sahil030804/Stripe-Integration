const Joi = require("joi");

module.exports = {
  createPaymentIntent: {
    body: Joi.object({
      priceId: Joi.string().required(),
      promocodeId: Joi.string().optional(),
    }),
  },
  confirmPaymentIntent: {
    body: Joi.object({
      paymentIntentId: Joi.string().required(),
      paymentMethodId: Joi.string().required(),
    }),
  },
};
