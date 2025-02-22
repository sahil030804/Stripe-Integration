const config = require("../config/config");
const common = require("../constants/common");
const { Product } = require("../db/models");

const stripe = require("stripe")(config.stripeConfig.STRIPE_SECRET_KEY);

class ProductDb extends Product {
  async productExistingCheck(id) {
    const product = await this.findProductById(id);
    if (!product) {
      return false;
    }
    return true;
  }
  async findProductById(id) {
    const product = await Product.findByPk(id, { raw: true });
    return product;
  }
  async createProductPriceInStripe(productData) {
    const price = await stripe.prices.create({
      currency: common.currency.USD,
      unit_amount: productData.price * 100,
      product_data: {
        name: productData.name,
      },
    });
    return price;
  }

  deleteStripeProductPrice(priceId, productId) {
    stripe.products.update(productId, { active: false });
    stripe.prices.update(priceId, {
      active: false,
    });
  }

  async updateProductPriceInStripe(priceId, productId, productData) {
    const price = await stripe.prices.create({
      unit_amount: productData.price * 100,
      currency: common.currency.USD,
      product_data: {
        name: productData.name,
      },
    });
    this.deleteStripeProductPrice(priceId, productId);
    return price;
  }
  async createProduct(productData) {
    const stripeProductPrice = await this.createProductPriceInStripe(
      productData
    );
    productData.currency = common.currency.USD;
    productData.stripePriceId = stripeProductPrice.id;
    productData.stripeProductId = stripeProductPrice.product;
    const product = await Product.create(productData);
    return product.toJSON();
  }

  async updateProduct(data, id) {
    const product = await this.findProductById(id);
    const stripeProductPrice = await this.updateProductPriceInStripe(
      product.stripePriceId,
      product.stripeProductId,
      data
    );
    data.stripePriceId = stripeProductPrice.id;
    data.stripeProductId = stripeProductPrice.product;
    const newProduct = await Product.update(data, {
      where: { id },
      returning: true, // it returns updatedrow number and whole object in array
      plain: true,
    });
    return newProduct[1]; //it returns only new product data
  }

  async deleteProduct(id) {
    const product = await this.findProductById(id);
    await Product.destroy({ where: { id } });
    this.deleteStripeProductPrice(
      product.stripePriceId,
      product.stripeProductId
    );
  }
  async getAllProductsFromDb(page, limit) {
    const products = await Product.findAll({
      limit,
      offset: (page - 1) * limit,
      raw: true,
    });
    return products;
  }
}

module.exports = new ProductDb();
module.exports.ProductMdl = Product;
