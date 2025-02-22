const productService = require("./product.service");

class ProductController {
  async addProduct(req, res, next) {
    try {
      const product = await productService.addProduct(req.body);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }
  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(
        req.body,
        req.params.id
      );
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }
  async getAllProducts(req, res, next) {
    try {
      const products = await productService.getAllProducts(
        req.body.page,
        req.body.limit
      );
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }
  async getSingleProduct(req, res, next) {
    try {
      const products = await productService.getSingleProduct(req.params.id);
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new ProductController();
