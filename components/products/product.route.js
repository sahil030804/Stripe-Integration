const express = require("express");
const validate = require("../../middleware/validation");
const authMiddleware = require("../../middleware/authMiddleware");

const validateSchema = require("./product.validation");
const productController = require("./product.controller");

const router = express.Router();

router.post(
  "/list",
  validate(validateSchema.pagination),
  productController.getAllProducts
);
router.post(
  "/",
  validate(validateSchema.addProduct),
  productController.addProduct
);
router.put(
  "/:id",
  validate(validateSchema.updateProduct),
  productController.updateProduct
);
router.get(
  "/:id",
  validate(validateSchema.productId),
  productController.getSingleProduct
);
router.delete(
  "/:id",
  validate(validateSchema.productId),
  productController.deleteProduct
);

module.exports = router;
