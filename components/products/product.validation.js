const Joi = require("joi");
const common = require("../../constants/common");

module.exports = {
  addProduct: {
    body: Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required().min(1),
      description: Joi.string(),
    }),
  },
  updateProduct: {
    body: Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required().min(1),
      description: Joi.string(),
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
  productId: {
    params: Joi.object({
      id: Joi.number().required(),
    }),
  },
};
