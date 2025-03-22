const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const existingCart = await Cart.findOne({ saved: false });
    if (existingCart) return res.json(existingCart);

    const newCart = new Cart({ products: [], saved: false });
    await newCart.save();
    res.json(newCart);
  } catch (error) {
    console.error("❌ Error creando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    let cart = await Cart.findById(req.params.cid).populate("products.productId");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    if (cart.saved) {
      const newCart = new Cart({ products: [], saved: false });
      await newCart.save();
      return res.status(200).json(newCart);
    }

    res.json(cart);
  } catch (error) {
    console.error("❌ Error obteniendo carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Guardar carrito
router.put("/:cid/save", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    if (!cart.products || cart.products.length === 0)
      return res.status(400).json({ error: "No se puede guardar un carrito vacío." });

    cart.saved = true;
    await cart.save();

    res.json({ message: "✅ Carrito guardado correctamente." });
    req.app.get("io").emit("cartSaved", cart._id);
  } catch (error) {
    console.error("❌ Error guardando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.productId");
    const product = await Product.findById(req.params.pid);

    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    if (product.stock <= 0)
      return res.status(400).json({ error: "Sin stock disponible" });

    product.stock -= 1;
    await product.save();

    const itemIndex = cart.products.findIndex(p => p.productId.equals(product._id));
    if (itemIndex !== -1) {
      cart.products[itemIndex].quantity++;
    } else {
      cart.products.push({ productId: product._id, quantity: 1 });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("products.productId");
    const updatedProducts = await Product.find().lean();

    const io = req.app.get("io");
    io.emit("updateCart", updatedCart);
    io.emit("updateProducts", updatedProducts);

    res.json(updatedCart);
  } catch (error) {
    console.error("❌ Error agregando producto al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(item => !item.productId.equals(req.params.pid));
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("products.productId");
    req.app.get("io").emit("updateCart", updatedCart);

    res.json(updatedCart);
  } catch (error) {
    console.error("❌ Error eliminando producto del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Vaciar el carrito
// Vaciar el carrito y devolver stock
router.delete("/:cid", async (req, res) => {
  try {
    console.log(`🗑️ Vaciando carrito con ID: ${req.params.cid}`);
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Reponer stock por cada producto
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    cart.products = [];
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("products.productId");

    console.log("✅ Carrito vaciado con éxito y stock restablecido.");

    req.app.get("io").emit("updateCart", updatedCart);

    const allProducts = await Product.find();
    req.app.get("io").emit("updateProducts", allProducts);

    res.json(updatedCart);
  } catch (error) {
    console.error("❌ Error vaciando carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Limpiar carritos vacíos
(async () => {
  try {
    await Cart.deleteMany({ products: [], saved: false });
  } catch (error) {
    console.error("❌ Error limpiando carritos vacíos:", error);
  }
})();

module.exports = router;
