const productDb = require("../../dbUtils/productDb");

class ProductService {
  async addProduct(productData) {
    try {
      const product = await productDb.createProduct(productData);
      delete product.stripePriceId;
      delete product.stripeProductId;
      return { product };
    } catch (err) {
      throw new Error(err);
    }
  }
  async updateProduct(productData, productId) {
    try {
      const isProductExist = await productDb.productExistingCheck(productId);
      if (!isProductExist) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      const product = await productDb.updateProduct(productData, productId);
      delete product.stripePriceId;
      delete product.stripeProductId;
      return { product };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getAllProducts(page, limit) {
    try {
      const products = await productDb.getAllProductsFromDb(page, limit);
      if (!products) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      products.map((product) => {
        delete product.stripePriceId;
        delete product.stripeProductId;
      });
      return { products };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getSingleProduct(productId) {
    try {
      const product = await productDb.findProductById(productId);
      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      delete product.stripePriceId;
      delete product.stripeProductId;
      return { product };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async deleteProduct(productId) {
    try {
      const isProductExist = await productDb.productExistingCheck(productId);
      if (!isProductExist) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      await productDb.deleteProduct(productId);
      return { message: "Product deleted successfully" };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
module.exports = new ProductService();
