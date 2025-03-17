const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const purchaseController = require('./purchase.controller');

const router = express.Router();

router.get(
  '/active-subscription-plan',
  authMiddleware.isUserLoggedIn,
  purchaseController.getActiveSubscriptionOfUser
);
router.get(
  '/active-onetime-plan',
  authMiddleware.isUserLoggedIn,
  purchaseController.getActiveOnetimePlanOfUser
);
router.get(
  '/history',
  authMiddleware.isUserLoggedIn,
  purchaseController.getHistoryOfUserPurchase
);
router.get(
  '/:id',
  authMiddleware.isUserLoggedIn,
  purchaseController.checkPaymentStatus
);

module.exports = router;
