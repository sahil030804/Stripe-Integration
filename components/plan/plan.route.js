const express = require("express");
const validate = require("../../middleware/validation");
const authMiddleware = require("../../middleware/authMiddleware");

const validateSchema = require("./plan.validation");
const planController = require("./plan.controller");
const router = express.Router();

router.post(
  "/list",
  validate(validateSchema.pagination),
  planController.getAllPlans
);
router.get(
  "/onetime-plans",
  // authMiddleware.isUserLoggedIn,
  planController.getOnetimePlans
);
router.get(
  "/subscription-plans",
  // authMiddleware.isUserLoggedIn,
  planController.getSubscriptionPlans
);
router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.createPlan),
  planController.createPlan
);
router.put(
  "/:id",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.updatePlan),
  planController.updatePlan
);
router.get(
  "/:id",
  validate(validateSchema.planId),
  planController.getSinglePlan
);
router.delete(
  "/:id",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.planId),
  planController.deletePlan
);

module.exports = router;
