const config = require("../config/config");
const { User } = require("../db/models");
const bcrypt = require("bcrypt");

class UserDb extends User {
  async countExistingEmail(email) {
    const countExistingEmail = await User.findAndCountAll({
      where: { email },
    });

    if (countExistingEmail.count > 0) {
      return false;
    }
    return true;
  }

  async encryptPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  validatePassword(password, dbPassword) {
    return bcrypt.compareSync(password, dbPassword);
  }

  async createUser(userData) {
    const user = await User.create(userData);
    return user.toJSON();
  }

  async findUserByEmail(email, attributes = null) {
    const user = await User.findOne({
      where: { email },
      attributes,
      raw: true,
    });
    return user;
  }

  async findUserById(id, attributes = null) {
    const user = await User.findByPk(id, { attributes, raw: true });
    return user;
  }

  async updateUserDataByCustomerId(stripeCustomerId, data) {
    await User.update(data, { where: { stripeCustomerId } });
  }
  
  async findUserBystripeCustomerId(stripeCustomerId, attributes = null) {
    const user = await User.findOne({
      where: { stripeCustomerId },
      attributes,
      raw: true,
    });
    return user;
  }

  async addPaymentMethodToCustomerDb(
    paymentMethodId,
    paymentMethodType,
    stripeCustomerId
  ) {
    const user = await this.findUserBystripeCustomerId(stripeCustomerId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const paymentMethods = user.paymentMethods || [];
    paymentMethods.push({
      id: paymentMethodId,
      type: paymentMethodType,
    });

    await User.update(
      { paymentMethods },
      {
        where: { stripeCustomerId },
      }
    );
  }

  async deletePaymentMethodFromCustomerDB(stripeCustomerId, paymentMethodId) {
    const user = await this.findUserBystripeCustomerId(stripeCustomerId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    let existingPaymentMethods = user.paymentMethods || [];

    existingPaymentMethods = existingPaymentMethods.filter(
      (method) => method.id !== paymentMethodId
    );

    await this.updateUserDataByCustomerId(stripeCustomerId, {
      paymentMethods: existingPaymentMethods,
    });
  }

  async addCustomerDefaultMethodInDb(stripeCustomerId, id, type) {
    await User.update(
      { defaultPaymentMethod: { id, type } },
      { where: { stripeCustomerId } }
    );
  }
}

module.exports = new UserDb();

module.exports.UserMdl = User;
