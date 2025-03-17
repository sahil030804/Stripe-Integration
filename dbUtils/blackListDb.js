const { Blacklist } = require('../db/models');

class BlacklistDb extends Blacklist {
  async getAllTokens() {
    const tokens = await Blacklist.findAll({ raw: true });
    return tokens;
  }

  async checkTokenInBlacklist(token) {
    const result = await Blacklist.findOne({ where: { token }, raw: true });
    if (result) {
      return true;
    }
    return false;
  }

  async addTokenToBlacklist(token) {
    await Blacklist.create({ token });
  }

  async deleteTokenByUSerId(id) {
    await Blacklist.destroy({ where: { id } });
  }
}

module.exports = new BlacklistDb();
module.exports.BlacklistMdl = Blacklist;
