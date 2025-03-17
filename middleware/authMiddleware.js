const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userDb = require('../dbUtils/userDb');
const blackListDb = require('../dbUtils/blackListDb');
const helper = require('../utils/helper');
const stripeHelper = require('../utils/stripeHelper');

class AuthMiddleware {
  async isUserLoggedIn(req, res, next) {
    try {
      const token = await helper.getTokenFromHeader(req);
      if (!token) {
        return next(new Error('ACCESS_TOKEN_REQUIRED'));
      }
      const result = await blackListDb.checkTokenInBlacklist(token);
      if (result) {
        return next(new Error('ACCESS_DENIED'));
      }
      const decoded = jwt.verify(token, config.jwtConfig.ACCESS_TOKEN_KEY);
      if (!decoded) {
        return next(new Error('INVALID_ACCESS_TOKEN'));
      }
      const user = await userDb.findUserById(decoded.id);
      if (!user) {
        return next(new Error('USER_NOT_FOUND'));
      }
      req.user = user;

      next();
    } catch (err) {
      return next(new Error(err.message));
    }
  }

  async checkActivePlanIsValid(req, res, next) {
    try {
      const subscriptions = await stripeHelper.getSubscriptionByCustomerId(
        req.user.stripeCustomerId
      );

      if (subscriptions.length > 0) {
        req.hasActiveSubscription = true;
        req.subscriptionData = subscriptions.data[0]; // get last active subscription
        next();
      }

      req.hasActiveSubscription = false;
      return next(new Error('Purchase plan first then access this page'));
    } catch (err) {
      console.error('Error from checking subscription status:', err);
      return next(new Error(err.message));
    }
  }
}
module.exports = new AuthMiddleware();
