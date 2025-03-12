const express = require("express");
const validate = require("../../middleware/validation");
const authMiddleware = require("../../middleware/authMiddleware");
const promocodeController = require("./promocode.controller");
const promocodeValidation = require("./promocode.validation");

const router = express.Router();

router.post(
  "/list",
  authMiddleware.isUserLoggedIn,
  validate(promocodeValidation.getAllActivePromocode),
  promocodeController.getAllActivePromocode
);
router.post(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(promocodeValidation.createPromocode),
  promocodeController.createPromocode
);
router.put(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(promocodeValidation.updatePromocode),
  promocodeController.updatePromocode
);

router.delete(
  "/",
  authMiddleware.isUserLoggedIn,
  validate(promocodeValidation.deletePromocode),
  promocodeController.deletePromocode
);

module.exports = router;
