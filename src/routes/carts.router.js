const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🔹 Crear un nuevo carrito SOLO si no existe uno en uso
router.post("/", async (req, res) => {
  try {
    console.log("📦 Creando un nuevo carrito...");
    const existingCart = await Cart.findOne({ saved: false });

    if (existingCart) {
      console.log("⚠️ Ya hay un carrito en uso, devolviendo el existente:", existingCart._id);
      return res.json(existingCart);
    }

    const newCart = new Cart({ products: [], saved: false });
    await newCart.save();
    console.log("✅ Nuevo carrito creado con éxito:", newCart._id);
    res.json(newCart);
  } catch (error) {
    console.error("❌ Error creando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Obtener un carrito por ID (Si está guardado, genera uno nuevo)
router.get("/:cid", async (req, res) => {
  try {
    console.log(`🔍 Buscando carrito con ID: ${req.params.cid}`);
    let cart = await Cart.findById(req.params.cid).populate("products.productId");

    if (!cart) {
      console.log("❌ Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // 📌 Si el carrito fue guardado, generar uno nuevo
    if (cart.saved) {
      console.log("📦 Carrito guardado, generando uno nuevo...");
      const newCart = new Cart({ products: [], saved: false });
      await newCart.save();
      return res.status(200).json(newCart);
    }

    console.log("✅ Carrito encontrado:", cart);
    res.json(cart);
  } catch (error) {
    console.error("❌ Error obteniendo carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Guardar el carrito (Solo si tiene productos)
router.put("/:cid/save", async (req, res) => {
  try {
    console.log(`📥 Guardando carrito con ID: ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      console.log("❌ Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // ❌ Evitar guardar carritos vacíos
    if (!cart.products || cart.products.length === 0) {
      console.log("🚫 No se puede guardar un carrito vacío.");
      return res.status(400).json({ error: "No se puede guardar un carrito vacío." });
    }

    cart.saved = true;
    await cart.save();

    console.log("✅ Carrito guardado correctamente.");
    res.json({ message: "✅ Carrito guardado correctamente." });

    // 🔹 Emitir actualización de carritos a todos los clientes
    req.app.get("io").emit("cartSaved", cart._id);
  } catch (error) {
    console.error("❌ Error guardando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    console.log(`📩 Agregando producto ${req.params.pid} al carrito ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid).populate("products.productId");
    const product = await Product.findById(req.params.pid);

    if (!cart) {
      console.log("❌ Carrito no encontrado");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    if (!product) {
      console.log("❌ Producto no encontrado");
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 📌 Buscar si el producto ya está en el carrito
    const itemIndex = cart.products.findIndex(p => p.productId.equals(req.params.pid));
    if (itemIndex !== -1) {
      cart.products[itemIndex].quantity++;
    } else {
      cart.products.push({ productId: product._id, quantity: 1 });
    }

    await cart.save();

    // 🔹 Volver a popular los productos antes de enviar respuesta
    const updatedCart = await Cart.findById(cart._id).populate("products.productId");

    console.log("✅ Producto agregado al carrito.");

    // 🔹 Emitir actualización del carrito a todos los clientes conectados
    req.app.get("io").emit("updateCart", updatedCart);
    res.json(updatedCart);
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
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(item => !item.productId.equals(req.params.pid));
    await cart.save();

    // 🔹 Volver a popular los productos antes de emitir la actualización
    const updatedCart = await Cart.findById(cart._id).populate("products.productId");

    console.log("✅ Producto eliminado del carrito.");

    // 🔹 Emitir actualización del carrito
    req.app.get("io").emit("updateCart", updatedCart);

    res.json(updatedCart);
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
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    // 🔹 Volver a popular los productos antes de emitir la actualización
    const updatedCart = await Cart.findById(cart._id).populate("products.productId");

    console.log("✅ Carrito vaciado con éxito.");

    // 🔹 Emitir actualización del carrito vacío
    req.app.get("io").emit("updateCart", updatedCart);

    res.json(updatedCart);
  } catch (error) {
    console.error("❌ Error vaciando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Limpiar carritos vacíos al iniciar el servidor
(async () => {
  try {
    console.log("🧹 Eliminando carritos vacíos al iniciar...");
    await Cart.deleteMany({ products: [], saved: false });
    console.log("✅ Carritos vacíos eliminados.");
  } catch (error) {
    console.error("❌ Error limpiando carritos vacíos:", error);
  }
})();

module.exports = router;
