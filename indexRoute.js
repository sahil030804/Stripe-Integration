const express = require("express");
const authRoute = require("./components/auth/auth.route");
const productRoute = require("./components/products/product.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/products", productRoute);

module.exports = router;
