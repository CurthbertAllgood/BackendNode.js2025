// src/dao/repositories/cart.repository.js
const cartDAO = require("../models/cart.dao");

class CartRepository {
  async createCart(data = { products: [], saved: false }) {
    return await cartDAO.create(data);
  }

  async getCartById(id) {
    return await cartDAO.findById(id);
  }

  async getActiveCart() {
    return await cartDAO.findActiveCart();
  }

  async saveCart(cart) {
    return await cartDAO.update(cart);
  }

  async clearEmptyCarts() {
    return await cartDAO.deleteEmptyUnsaved();
  }
}

module.exports = new CartRepository();
