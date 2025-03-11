const express = require("express");
const subscriptionController = require("./subscription.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const subscriptionValidation = require("./subscription.validation");
const validate = require("../../middleware/validation");

const router = express.Router();

router.put(
  "/pause",
  authMiddleware.isUserLoggedIn,
  // validate(subscriptionValidation.updateSubscription),
  subscriptionController.pauseSubscription
);
router.put(
  "/resume",
  authMiddleware.isUserLoggedIn,
  // validate(subscriptionValidation.updateSubscription),
  subscriptionController.resumeSubscription
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
router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(subscriptionValidation.createSubscription),
  subscriptionController.createSubscription
);
module.exports = router;
