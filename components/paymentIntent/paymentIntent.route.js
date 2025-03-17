const express = require('express');
const validate = require('../../middleware/validation');
const paymentIntentController = require('./paymentIntent.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const paymentIntentValidation = require('./paymentIntent.validation');

const router = express.Router();

router.post(
  '/',
  authMiddleware.isUserLoggedIn,
  validate(paymentIntentValidation.createPaymentIntent),
  paymentIntentController.createPaymentIntent
);

router.post(
  '/confirm',
  authMiddleware.isUserLoggedIn,
  validate(paymentIntentValidation.confirmPaymentIntent),
  paymentIntentController.confirmPaymentIntent
);

module.exports = router;
