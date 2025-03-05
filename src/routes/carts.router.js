const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🔹 Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    console.log("📦 Creando un nuevo carrito...");
    const newCart = new Cart({ products: [] });
    await newCart.save();
    console.log("✅ Carrito creado con éxito:", newCart._id);
    res.json(newCart);
  } catch (error) {
    console.error("❌ Error creando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    console.log(`🔍 Buscando carrito con ID: ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid).populate("products.productId");
    if (!cart) {
      console.log("❌ Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    console.log("✅ Carrito encontrado:", cart);
    res.json(cart);
  } catch (error) {
    console.error("❌ Error obteniendo carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    console.log(`📩 Recibida solicitud para agregar producto al carrito`);
    console.log("🛒 Cart ID:", req.params.cid);
    console.log("📦 Product ID:", req.params.pid);

    const cart = await Cart.findById(req.params.cid).populate("products.productId");
    const product = await Product.findById(req.params.pid);

    if (!cart) {
      console.log("❌ Error: Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    if (!product) {
      console.log("❌ Error: Producto no encontrado");
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.log("🛍️ Producto antes de agregar:", cart.products);

    const item = cart.products.find(p => p.productId.equals(req.params.pid));
    if (item) {
      console.log("🔄 Producto ya en el carrito, incrementando cantidad...");
      item.quantity++;
    } else {
      console.log("➕ Agregando nuevo producto al carrito...");
      cart.products.push({ productId: product._id, quantity: 1 });
    }

    await cart.save();
    console.log("✅ Producto agregado al carrito con éxito:", cart);

    // 🔹 Emitir actualización del carrito a todos los clientes conectados
    req.app.get("io").emit("updateCart", cart);

    res.json(cart);
  } catch (error) {
    console.error("❌ Error agregando producto al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Eliminar un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    console.log(`🗑️ Eliminando producto ${req.params.pid} del carrito ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      console.log("❌ Error: Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(item => !item.productId.equals(req.params.pid));
    await cart.save();

    console.log("✅ Producto eliminado del carrito:", cart);

    // 🔹 Emitir actualización del carrito
    req.app.get("io").emit("updateCart", cart);

    res.json(cart);
  } catch (error) {
    console.error("❌ Error eliminando producto del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Vaciar el carrito
router.delete("/:cid", async (req, res) => {
  try {
    console.log(`🗑️ Vaciando carrito con ID: ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      console.log("❌ Error: Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    console.log("✅ Carrito vaciado con éxito");

    // 🔹 Emitir actualización del carrito vacío
    req.app.get("io").emit("updateCart", cart);

    res.json(cart);
  } catch (error) {
    console.error("❌ Error vaciando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
