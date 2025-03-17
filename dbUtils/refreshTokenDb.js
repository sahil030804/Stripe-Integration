const config = require('../config/config');
const { RefreshToken } = require('../db/models');

class RefreshTokenDb extends RefreshToken {
  async findToken(token) {
    const refreshToken = await RefreshToken.findOne({
      where: { token },
      raw: true,
    });
    return refreshToken;
  }
  async addRefreshTokenInDb(token, userId) {
    const expiresAt = new Date();
    const refreshToken = await RefreshToken.create({
      token,
      userId,
      expiresAt: expiresAt.setMinutes(
        expiresAt.getMinutes() + Number(config.jwtConfig.REFRESH_TOKEN_EXPIRY)
      ),
    });
    return refreshToken;
  }

  async deleteRefreshToken(token) {
    await RefreshToken.destroy({ where: { token } });
  }
}

module.exports = new RefreshTokenDb();

module.exports.RefreshTokenMdl = RefreshToken;
