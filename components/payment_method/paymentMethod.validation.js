const Joi = require("joi");

module.exports = {
  createPaymentMethod: {
    body: Joi.object({
      type: Joi.string().valid("card").required().messages({
        "any.required": "Payment type is required.",
        "string.empty": "Payment type cannot be empty.",
      }),
      paymentDetails: Joi.object({
        // cardNumber : Joi.number().required(),
        // cvv : Joi.number().min(3).max(3).required(),
        // expiryYear: Joi.string().required(),
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

  paymentMethodId: {
    body: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
