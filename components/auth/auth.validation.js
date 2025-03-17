const Joi = require('joi');

module.exports = {
  register: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Name cannot be empty.',
        'any.required': 'Name is required.',
      }),
      email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required.',
      }),
      password: Joi.string().min(6).max(18).required().messages({
        'string.empty': 'Password cannot be empty.',
        'any.required': 'Password is required.',
        'string.min': 'Password must be at least 6 characters long.',
        'string.max': 'Password cannot exceed 18 characters.',
      }),
      confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
          'string.empty': 'Confirm Password cannot be empty.',
          'any.required': 'Confirm Password is required.',
          'any.only': 'Confirm password must match with password',
        }),
      phoneNumber: Joi.string()
        .required()
        .pattern(/^[0-9]{10}$/)
        .messages({
          'string.empty': 'Phone number cannot be empty.',
          'any.required': 'Phone number is required.',
          'string.pattern.base': 'Phone number must be exactly 10 digits.',
        }),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required.',
      }),
      password: Joi.string().required().messages({
        'string.empty': 'Password cannot be empty.',
        'any.required': 'Password is required.',
      }),
    }),
  },

  refreshAccessToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'string.empty': 'RefreshToken cannot be empty.',
        'any.required': 'RefreshToken is required.',
      }),
    }),
  },
};
