// src/dao/repositories/cart.repository.js
const cartDAO = require("../dao/cart.dao");

class CartRepository {
  async createCart(data = { products: [], saved: false, userId: null }) {
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

  async getActiveCartByUserId(userId) {
    return await cartDAO.findActiveCartByUserId(userId);
  }

  async mergeSessionCartToUser(userCart, sessionCart) {
    for (const sessionItem of sessionCart) {
      const index = userCart.products.findIndex(p => p.productId.toString() === sessionItem.productId.toString());
      if (index >= 0) {
        userCart.products[index].quantity += sessionItem.quantity;
      } else {
        userCart.products.push({ productId: sessionItem.productId, quantity: sessionItem.quantity });
      }
    }
    return await cartDAO.update(userCart);
  }
}

module.exports = new CartRepository();