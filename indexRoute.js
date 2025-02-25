const express = require("express");
const authRoute = require("./components/auth/auth.route");
const productRoute = require("./components/products/product.route");
const paymentMethodRoute = require("./components/payment_method/paymentMethod.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/products", productRoute);
router.use("/paymentMethods", paymentMethodRoute);

module.exports = router;
