// src/services/cart.service.js

const CartRepository = require("../repositories/cart.repository");

async function mergeSessionCart(userId, sessionCart) {
  let cart = await CartRepository.getActiveCartByUserId(userId);

  if (!cart) {
    cart = await CartRepository.createCart({ user: userId, products: [] });
  }

  for (const item of sessionCart) {
    const existingProduct = cart.products.find(p => p.product.toString() === item.product.toString());

    if (existingProduct) {
      existingProduct.quantity += item.quantity;
    } else {
      cart.products.push({
        product: item.product,
        quantity: item.quantity,
      });
    }
  }

  await CartRepository.saveCart(cart);
}

module.exports = {
  mergeSessionCart,
};
