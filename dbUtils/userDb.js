const { User } = require("../db/models");
const bcrypt = require("bcrypt");
const stripe = require("stripe")(
  "sk_test_51OuQvfSJvKxGyYS60FppkGxlsGpGtMIOhPr1OWjDmcQCWGJKJPyST7PK5h195ccBR549CTe5NjgtD0Qjsygelbld002hQLrLUv"
);

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

  async createStripeCustomer(customerData) {
    const user = await stripe.customers.create({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone_number,
    });
    return user.id;
  }

  async findUserByEmail(email) {
    const user = await User.findOne({ where: { email }, raw: true });
    return user;
  }

  async findUserById(id) {
    const user = await User.findByPk(id);
    return user;
  }
}

module.exports = new UserDb();

module.exports.UserMdl = User;
