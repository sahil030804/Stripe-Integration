const Joi = require("joi");
const common = require("../../constants/common");

module.exports = {
  createPlan: {
    body: Joi.object({
      name: Joi.string().required(),
      currency: Joi.string().required(),
      description: Joi.string(),
      onetime: Joi.array(),
      subscription: Joi.array(),
    }),
  },
  updatePlan: {
    body: Joi.object({
      name: Joi.string().required(),
      currency: Joi.string().required(),
      description: Joi.string(),
      onetime: Joi.array(),
      subscription: Joi.array(),
    }),
    params: Joi.object({
      id: Joi.number().required(),
    }),
  },
  pagination: {
    body: Joi.object({
      page: Joi.number().default(1).min(1).required(),
      limit: Joi.number().min(10).default(15).required(),
    }),
  },
  planId: {
    params: Joi.object({
      id: Joi.number().required(),
    }),
  },
};
