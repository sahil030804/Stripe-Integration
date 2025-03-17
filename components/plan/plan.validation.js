const Joi = require('joi');

module.exports = {
  createPlan: {
    body: Joi.object({
      name: Joi.string().required(),
      currency: Joi.string().required(),
      description: Joi.string(),
      onetime: Joi.array().items(
        Joi.object({
          amount: Joi.number().min(1).required(),
          validity: Joi.string().required(),
          type: Joi.string().required(),
        })
      ),
      subscription: Joi.array().items(
        Joi.object({
          amount: Joi.number().min(1).required(),
          interval: Joi.string().required(),
        })
      ),
    }),
  },

  updatePlan: {
    body: Joi.object({
      name: Joi.string().required(),
      currency: Joi.string().required(),
      description: Joi.string(),
      onetime: Joi.array().items(
        Joi.object({
          amount: Joi.number().min(1).required(),
          validity: Joi.string().required(),
          type: Joi.string().required(),
        })
      ),
      subscription: Joi.array().items(
        Joi.object({
          amount: Joi.number().min(1).required(),
          interval: Joi.string().required(),
        })
      ),
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
