const express = require("express");
const authRoute = require("./components/auth/auth.route");
const planRoute = require("./components/plan/plan.route");
const paymentMethodRoute = require("./components/paymentMethod/paymentMethod.route");
const paymentIntentRoute = require("./components/paymentIntent/paymentIntent.route");
const purchaseRoute = require("./components/purchase/purchase.route");
const subscriptionRoute = require("./components/subscription/subscription.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/plans", planRoute);
router.use("/payment-methods", paymentMethodRoute);
router.use("/onetime", paymentIntentRoute);
router.use("/purchase", purchaseRoute);
router.use("/subscriptions", subscriptionRoute);

module.exports = router;
