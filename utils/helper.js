const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const refreshTokenDb = require("../dbUtils/refreshTokenDb");

class Helper {
  async generateAccessAndRefreshToken(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      config.jwtConfig.ACCESS_TOKEN_KEY,
      { expiresIn: `${config.jwtConfig.ACCESS_TOKEN_EXPIRY}m` }
    );

    const refreshToken = uuidv4();

    await refreshTokenDb.addRefreshTokenInDb(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  getTokenFromHeader(req) {
    let token;
    const authToken = req.headers["authorization"];
    if (authToken && authToken.startsWith("Bearer")) {
      token = authToken.split(" ")[1];
    }
    return token;
  }
}
module.exports = new Helper();
