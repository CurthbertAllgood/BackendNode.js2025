const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const cartsFile = path.join(__dirname, "../data/carrito.json");

// Función para cargar los carritos desde el archivo JSON
const loadCarts = () => {
  if (!fs.existsSync(cartsFile)) return [];
  const data = fs.readFileSync(cartsFile, "utf-8");
  return data ? JSON.parse(data) : [];
};

// Función para guardar los carritos en el archivo JSON
const saveCarts = (carts) => {
  fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), "utf-8");
};

// 🔹 Crear un nuevo carrito
router.post("/", (req, res) => {
  const carts = loadCarts();
  const newCart = { id: uuidv4(), products: [] };
  carts.push(newCart);
  saveCarts(carts);
  res.status(201).json(newCart);
});

// 🔹 Obtener productos de un carrito específico
router.get("/:cid", (req, res) => {
  const carts = loadCarts();
  const cart = carts.find((c) => c.id === req.params.cid);

  if (!cart) {
    return res.status(404).json({ error: "❌ Carrito no encontrado" });
  }

  res.json(cart.products);
});

// 🔹 Agregar un producto a un carrito
router.post("/:cid/product/:pid", (req, res) => {
  const carts = loadCarts();
  const { cid, pid } = req.params;

  const cart = carts.find((c) => c.id === cid);
  if (!cart) {
    return res.status(404).json({ error: "❌ Carrito no encontrado" });
  }

  // Verificar si el producto ya existe en el carrito
  const productIndex = cart.products.findIndex((p) => p.product === pid);

  if (productIndex === -1) {
    cart.products.push({ product: pid, quantity: 1 });
  } else {
    cart.products[productIndex].quantity++;
  }

  saveCarts(carts);
  res.json(cart);
});

module.exports = router;
