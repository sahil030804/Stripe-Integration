const { Op, Sequelize } = require('sequelize');
const promocodeDb = require('../../dbUtils/promocodeDb');
const helper = require('../../utils/helper');
const stripeHelper = require('../../utils/stripeHelper');

class PromocodeService {
  async createPromocode(promoCodeData, loggedInUserId) {
    try {
      const isPromocodeExist = await promocodeDb.findPromocodeByFilter(
        { code: promoCodeData.code },
        ['isActive']
      );
      if (isPromocodeExist && isPromocodeExist.isActive != 'false') {
        throw new Error('Promo code already exist');
      }
      promoCodeData.expires_at = await helper.convertDateToTimestamp(
        promoCodeData.expires_at
      );
      const coupon = await stripeHelper.createCoupen(promoCodeData);
      const promocode = await stripeHelper.createPromocode(
        promoCodeData,
        coupon.id
      );
      const result = await promocodeDb.addPromocodeInDb(
        promocode,
        loggedInUserId
      );
      return { promocode: result };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deletePromocode(promocodeId, loggedInUserId) {
    try {
      const promocodeData = await promocodeDb.findPromocodeByFilter(
        { stripePromoCodeId: promocodeId, isActive: { [Op.eq]: 'true' } },
        ['isActive', 'stripeCouponId']
      );
      if (!promocodeData || promocodeData.isActive == 'false') {
        throw new Error('CODE_ALREADY_DELETED');
      }

      await stripeHelper.deleteCoupon(promocodeData.stripeCouponId);
      await stripeHelper.deletePromoCode(promocodeId);
      await promocodeDb.deletePromocodeInDb(
        { stripeCouponId: promocodeData.stripeCouponId },
        loggedInUserId
      );
      return { message: 'deleted successfully' };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updatePromocode(promocodeId, updateData, loggedInUserId) {
    try {
      const promocodeData = await promocodeDb.findPromocodeByFilter(
        { stripePromoCodeId: promocodeId, isActive: { [Op.eq]: 'true' } },
        ['isActive', 'stripeCouponId', 'code']
      );
      if (
        !promocodeData ||
        (promocodeData.isActive == 'false' && !promocodeData.deletedBy)
      ) {
        throw new Error('CODE_ALREADY_DELETED');
      }
      const checkPromocodeExistWithName =
        await promocodeDb.countPromocodeByQuery({
          where: {
            [Op.and]: [
              { code: { [Op.iLike]: updateData.name } },
              { stripePromoCodeId: { [Op.ne]: promocodeId } },
            ],
          },
        });
      if (checkPromocodeExistWithName > 0) {
        throw new Error('CODE_ALREADY_EXIST');
      }
      const updatedCoupon = await stripeHelper.updateCoupon(
        promocodeData.stripeCouponId,
        {
          name: updateData.name,
        }
      );

      const result = await promocodeDb.updatePromocodeInDb(
        { stripePromoCodeId: promocodeId },
        {
          stripeCouponId: updatedCoupon.id,
          updatedBy: loggedInUserId,
        }
      );
      return { updatedPromocode: result };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getAllActivePromocode(amount, currency, page, limit) {
    try {
      const allPromocode = await promocodeDb.findAllPromocodeFromDb(
        {
          [Op.and]: [
            {
              [Op.or]: [
                { minimum_amount: { [Op.lte]: amount } },
                { minimum_amount: { [Op.is]: null } },
              ],
            },
            {
              [Op.or]: [
                { minimum_amount_currency: { [Op.eq]: currency } },
                { minimum_amount_currency: { [Op.is]: null } },
              ],
            },
            Sequelize.where(
              Sequelize.literal('max_redemptions - times_redeemed'),
              { [Op.gt]: 0 }
            ),
          ],
        },
        page,
        limit,
        { exclude: ['createdBy', 'updatedBy', 'deletedBy'] }
      );
      return { allPromocode };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new PromocodeService();
