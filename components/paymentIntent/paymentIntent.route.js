const express = require("express");
const validate = require("../../middleware/validation");
const paymentIntentController = require("./paymentIntent.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  paymentIntentController.createPaymentIntent
);

router.post(
  "/confirm",
  authMiddleware.isUserLoggedIn,
  //   validate(subscriptionValidation.createSubscription),
  paymentIntentController.confirmPaymentIntent
);



module.exports = router;
