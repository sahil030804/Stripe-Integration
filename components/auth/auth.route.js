const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middleware/validation");
const validateSchema = require("./auth.validation");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  validate(validateSchema.register),
  authController.register
);

router.post("/login", validate(validateSchema.login), authController.login);
router.post(
  "/logout",
  authMiddleware.isUserLoggedIn,
  validate(validateSchema.refreshAccessToken),
  authController.logout
);
router.post(
  "/refresh-token",
  validate(validateSchema.refreshAccessToken),
  authController.refreshAccessToken
);

module.exports = router;
