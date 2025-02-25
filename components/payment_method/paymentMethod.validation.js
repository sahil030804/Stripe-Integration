const Joi = require("joi");

module.exports = {
  createPaymentMethod: {
    body: Joi.object({
      type: Joi.string().valid("card", "us_bank_account").required().messages({
        "any.required": "Payment type is required.",
        "string.empty": "Payment type cannot be empty.",
      }),

      paymentDetails: Joi.object({
        token: Joi.string().required(),
      }).required(),

      billingDetails: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        phone: Joi.string(),
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
