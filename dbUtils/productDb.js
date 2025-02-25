const config = require("../config/config");
const common = require("../constants/common");
const { Product } = require("../db/models");

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

  async createProduct(productData, stripePriceId, stripeProductId) {
    productData.currency = common.currency.USD;
    productData.stripePriceId = stripePriceId;
    productData.stripeProductId = stripeProductId;
    const product = await Product.create(productData);
    return product.toJSON();
  }

  async updateProduct(data, id) {
    const newProduct = await Product.update(data, {
      where: { id },
      returning: true, // it returns updatedrow number and whole object in array
      plain: true,
    });
    return newProduct[1]; //it returns only new product data
  }

  async deleteProduct(id) {
    await Product.destroy({ where: { id } });
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
