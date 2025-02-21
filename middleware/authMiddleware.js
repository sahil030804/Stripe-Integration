const jwt = require("jsonwebtoken");
const config = require("../config/config");
const userDb = require("../dbUtils/userDb");
const blackListDb = require("../dbUtils/blackListDb");
const helper = require("../utils/helper");

class AuthMiddleware {
  async isUserLoggedIn(req, res, next) {
    try {
      const token = await helper.getTokenFromHeader(req);
      if (!token) {
        return next(new Error("ACCESS_TOKEN_REQUIRED"));
      }
      const result = await blackListDb.checkTokenInBlacklist(token);
      if (result) {
        return next(new Error("ACCESS_DENIED"));
      }
      const decoded = jwt.verify(token, config.jwtConfig.ACCESS_TOKEN_KEY);
      if (!decoded) {
        return next(new Error("INVALID_ACCESS_TOKEN"));
      }
      const user = await userDb.findUserById(decoded.id);
      if (!user) {
        return next(new Error("USER_NOT_FOUND"));
      }
      req.user = user;
      next();
    } catch (err) {
      return next(new Error(err.message));
    }
  }
}

module.exports = new AuthMiddleware();
