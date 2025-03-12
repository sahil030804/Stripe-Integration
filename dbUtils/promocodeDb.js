const { Promocode, User } = require("../db/models");

class PromocodeDb extends Promocode {
  async countPromocodeByQuery(query) {
    const existingPromocde = await Promocode.findAndCountAll(query);
    return existingPromocde.count;
  }

  async addPromocodeInDb(promocodeObj, loggedInUserId) {
    const result = await Promocode.create({
      stripeCouponId: promocodeObj.coupon.id,
      stripePromoCodeId: promocodeObj.id,
      code: promocodeObj.code,
      currency: promocodeObj.coupon.currency,
      duration: promocodeObj.coupon.duration,
      duration_in_months: promocodeObj.coupon.duration_in_months,
      amount_off: promocodeObj.coupon.amount_off / 100,
      percent_off: promocodeObj.coupon.percent_off,
      max_redemptions: promocodeObj.max_redemptions,
      times_redeemed: promocodeObj.times_redeemed,
      minimum_amount: promocodeObj.restrictions.minimum_amount || 0,
      minimum_amount_currency:
        promocodeObj.restrictions.minimum_amount_currency,
      expiresAt: new Date(promocodeObj.expires_at * 1000),
      isActive: promocodeObj.active,
      createdBy: loggedInUserId,
      updatedBy: loggedInUserId,
    });
    return result;
  }

  async deletePromocodeInDb(query, loggedInUserId) {
    await Promocode.update(
      {
        isActive: "false",
        deletedBy: loggedInUserId,
      },
      { where: query }
    );
  }
  async updatePromocodeInDb(query, updateObj) {
    const result = await Promocode.update(updateObj, {
      where: query,
      returning: true,
      plain: true,
    });
    return result[1];
  }

  async findPromocodeByFilter(filter, attributes = null) {
    return await Promocode.findOne({
      where: filter,
      attributes,
      raw: true,
    });
  }

  async findAllPromocodeFromDb(filter, page, limit, attributes = null) {
    const result = await Promocode.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: "createdByUser",
          attributes: ["name", "email"],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["name", "email"],
        },
        {
          model: User,
          as: "deletedByUser",
          attributes: ["name", "email"],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      raw: true,
      attributes,
    });

    return result;
  }
}
module.exports = new PromocodeDb();
module.exports.PromocodeMdl = Promocode;
