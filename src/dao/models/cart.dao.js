// src/dao/models/cart.dao.js
const Cart = require("../../models/Cart");

class CartDAO {
  async create(data) {
    return await Cart.create(data);
  }

  async findById(id) {
    return await Cart.findById(id).populate("products.productId");
  }

  async findActiveCart() {
    return await Cart.findOne({ saved: false }).populate("products.productId");
  }

  async update(cart) {
    return await cart.save();
  }

  async deleteEmptyUnsaved() {
    return await Cart.deleteMany({ products: [], saved: false });
  }
}

module.exports = new CartDAO();
