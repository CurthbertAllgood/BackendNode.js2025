// src/dao/models/product.dao.js
const Product = require("../../models/Product");

class ProductDAO {
  async findById(id) {
    return await Product.findById(id);
  }

  async findAll(query = {}, options = {}) {
    return await Product.paginate(query, options);
  }

  async findWithFilters(filter = {}, sort) {
    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};
    return await Product.find(filter).sort(sortOption);
  }

  async create(data) {
    return await Product.create(data);
  }

  async updateById(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async update(product) {
    return await product.save();
  }

  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  async addProductToCart(cartId, productId) {
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) return null;
    product.stock--;
    return await product.save();
  }
}

module.exports = new ProductDAO();
