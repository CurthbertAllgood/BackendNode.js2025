// src/dao/repositories/product.repository.js
const productDAO = require("../dao/product.dao");

class ProductRepository {
  async getProductById(id) {
    return await productDAO.findById(id);
  }

  async getAllProducts(query, options) {
    return await productDAO.findAll(query, options);
  }

  async getFilteredProducts(filter = {}, sort) {
    return await productDAO.findWithFilters(filter, sort);
  }

  async createProduct(productData) {
    return await productDAO.create(productData);
  }

  async updateProduct(id, updateData) {
    return await productDAO.updateById(id, updateData);
  }

  async saveProduct(product) {
    return await productDAO.update(product);
  }

  async deleteProduct(id) {
    return await productDAO.deleteById(id);
  }
}

module.exports = new ProductRepository();
