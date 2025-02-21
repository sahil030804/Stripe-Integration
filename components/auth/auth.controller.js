const helper = require("../../utils/helper");
const authService = require("./auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      const { accessToken, refreshToken } =
        await helper.generateAccessAndRefreshToken(user.userDetail.id);
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const user = await authService.login(req.body);

      const { accessToken, refreshToken } =
        await helper.generateAccessAndRefreshToken(user.userDetail.id);
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const accessToken = await helper.getTokenFromHeader(req);

      const result = await authService.logout(
        req.body.refreshToken,
        accessToken
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
  async refreshAccessToken(req, res, next) {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
