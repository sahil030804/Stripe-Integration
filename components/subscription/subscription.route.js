const express = require("express");
const subscriptionController = require("./subscription.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const subscriptionValidation = require("./subscription.validation");
const validate = require("../../middleware/validation");

const router = express.Router();

router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(subscriptionValidation.createSubscription),
  subscriptionController.createSubscription
);
router.put(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(subscriptionValidation.updateSubscription),
  subscriptionController.updateSubscription
);
router.delete(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(subscriptionValidation.cancelSubscription),
  subscriptionController.cancelSubscription
);

module.exports = router;
