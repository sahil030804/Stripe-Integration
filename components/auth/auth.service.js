const blackListDb = require('../../dbUtils/blackListDb');
const refreshTokenDb = require('../../dbUtils/refreshTokenDb');
const userDb = require('../../dbUtils/userDb');
const helper = require('../../utils/helper');
const stripeHelper = require('../../utils/stripeHelper');
class AuthService {
  async register(registerData) {
    const { name, email, password, phone_number } = registerData;
    try {
      const isEmailDuplicate = await userDb.countExistingEmail(email);
      if (!isEmailDuplicate) {
        throw new Error('USER_EXIST');
      }

      const stripeCustomerId = await stripeHelper.createStripeCustomer({
        name,
        email,
        phone_number,
      });
      registerData.stripeCustomerId = stripeCustomerId;
      registerData.password = await userDb.encryptPassword(password);
      const user = await userDb.createUser(registerData);

      delete user.password;
      delete user.stripeCustomerId;
      delete user.paymentMethods;
      delete user.defaultPaymentMethod;

      return { userDetail: user };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async login(loginData) {
    const { email, password } = loginData;
    try {
      const user = await userDb.findUserByEmail(email);
      if (!user) {
        throw new Error('EMAIL_NOT_FOUND');
      }

      if (!userDb.validatePassword(password, user.password)) {
        throw new Error('INVALID_PASSWORD');
      }
      delete user.password;
      delete user.paymentMethods;
      delete user.defaultPaymentMethod;
      delete user.stripeCustomerId;
      return { userDetail: user };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async logout(refreshToken, accessToken) {
    try {
      const token = await refreshTokenDb.findToken(refreshToken);
      if (!token) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      await refreshTokenDb.deleteRefreshToken(refreshToken);
      await blackListDb.addTokenToBlacklist(accessToken);
      return { message: 'Logout successfully' };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async refreshAccessToken(token) {
    try {
      const tokenObj = await refreshTokenDb.findToken(token);
      if (!tokenObj) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      const { accessToken, refreshToken } =
        await helper.generateAccessAndRefreshToken(tokenObj.userId);

      return { accessToken, refreshToken };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new AuthService();
