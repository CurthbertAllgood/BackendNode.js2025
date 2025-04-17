// src/controllers/cart.controller.js

const cartRepository = require("../dao/repositories/cart.repository");
const productRepository = require("../dao/repositories/product.repository");

exports.createCart = async (req, res) => {
  try {
    const cart = await cartRepository.createCart();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartRepository.getCartById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const product = await productRepository.getProductById(pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const item = cart.products.find(p => p.productId.equals(pid));
    item ? item.quantity++ : cart.products.push({ productId: pid, quantity: 1 });

    await cartRepository.saveCart(cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.decreaseQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    try {
      const cart = await cartRepository.getCartById(cid);
      if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  
      const item = cart.products.find(p => p.productId.equals(pid));
      if (!item) return res.status(404).json({ error: "Producto no encontrado en el carrito" });
  
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.products = cart.products.filter(p => !p.productId.equals(pid));
      }
  
      await cartRepository.saveCart(cart);
      const updatedCart = await cartRepository.getCartById(cid);
      res.json(updatedCart);
    } catch (error) {
      console.error("❌ Error disminuyendo cantidad:", error);
      res.status(500).json({ error: "Error disminuyendo cantidad" });
    }
  };
  

exports.removeProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartRepository.getCartById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => !p.productId.equals(pid));
    await cartRepository.saveCart(cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];
    await cartRepository.saveCart(cart);
    res.json({ message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
