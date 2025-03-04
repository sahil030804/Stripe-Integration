const express = require("express");
const validate = require("../../middleware/validation");
const authMiddleware = require("../../middleware/authMiddleware");

const paymentMethodController = require("./paymentMethod.controller");
const validateSchema = require("./paymentMethod.validation");

const router = express.Router();

router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.createPaymentMethod),
  paymentMethodController.createPaymentMethod
);
router.put(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.updatePaymentMethod),
  paymentMethodController.updatePaymentMethod
);
router.delete(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.paymentMethodId),
  paymentMethodController.deletePaymentMethodOfCustomer
);

router.get(
  "/list",
  authMiddleware.isUserLoggedIn,
  paymentMethodController.getAllPaymentMethodsOfCustomer
);

router.post(
  "/set-default",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.paymentMethodId),
  paymentMethodController.setDefaultMethodOfCustomer
);

module.exports = router;
