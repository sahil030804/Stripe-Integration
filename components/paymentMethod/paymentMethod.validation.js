const Joi = require('joi');

module.exports = {
  createPaymentMethod: {
    body: Joi.object({
      type: Joi.string().valid('card').required().messages({
        'any.required': 'Payment type is required.',
        'string.empty': 'Payment type cannot be empty.',
      }),
      paymentDetails: Joi.object({
        // number : Joi.number().required(),
        // cvc : Joi.number().min(3).required(),
        // exp_month: Joi.number().required(),
        // exp_year: Joi.number().required(),
        token: Joi.string().required(),
      }).required(),
      billingDetails: Joi.object({
        name: Joi.string().required(),
        address: Joi.object({
          line1: Joi.string().required(),
          city: Joi.string(),
          state: Joi.string(),
          postal_code: Joi.string(),
          country: Joi.string().length(2).uppercase(),
        }),
      }),
    }),
  },
  updatePaymentMethod: {
    body: Joi.object({
      paymentMethodId: Joi.string().required(),
      paymentDetails: Joi.object({
        exp_month: Joi.number().required(),
        exp_year: Joi.number().required(),
      }).required(),
      billingDetails: Joi.object({
        name: Joi.string().required(),
        address: Joi.object({
          line1: Joi.string().required(),
          city: Joi.string(),
          state: Joi.string(),
          postal_code: Joi.string(),
          country: Joi.string().length(2).uppercase(),
        }),
      }),
    }),
  },

  paymentMethodId: {
    body: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
