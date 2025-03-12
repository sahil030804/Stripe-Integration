const Joi = require("joi");

module.exports = {
  createPromocode: {
    body: Joi.object({
      code: Joi.string().required(),
      currency: Joi.string().required(),
      durationType: Joi.string().required(),
      duration_in_months: Joi.number().default(6),
      name: Joi.string().required(),
      max_redemptions: Joi.number(),
      percent_off: Joi.number(),
      amount_off: Joi.number(),
      minimum_amount: Joi.number(),
      minimum_amount_currency: Joi.string(),
      expires_at: Joi.string(),
    }),
  },
  updatePromocode: {
    body: Joi.object({
      stripePromoCodeId: Joi.string().required(),
      name: Joi.string().required(),
    }),
  },
  deletePromocode: {
    body: Joi.object({
      stripePromoCodeId: Joi.string().required(),
    }),
  },
  getAllActivePromocode: {
    body: Joi.object({
      amount: Joi.number().required(),
      currency: Joi.string().required(),
      page: Joi.number().default(1).min(1).required(),
      limit: Joi.number().min(10).default(15).required(),
    }),
  },
};
