const express = require("express");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const router = express.Router();
const productsFile = path.join(__dirname, "../data/productos.json");

// Función para cargar productos
const loadProducts = () => {
  if (!fs.existsSync(productsFile)) return [];
  const data = fs.readFileSync(productsFile, "utf-8");
  return JSON.parse(data);
};

// Función para guardar productos
const saveProducts = (products) => {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), "utf-8");
};

// 🔹 Obtener todos los productos
router.get("/", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

router.get("/:pid", (req, res) => {
  const products = loadProducts();
  const { pid } = req.params;

  console.log("📌 Buscando producto con ID:", pid);
  console.log("🔍 Lista de IDs en productos.json:", products.map(p => p.id));

  const product = products.find((p) => p.id === pid);

  if (!product) {
    console.log("❌ Producto NO encontrado. Verifica si el ID está bien escrito.");
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  console.log("✅ Producto encontrado:", product);
  res.json(product);
});


// 🔹 Agregar un nuevo producto
router.post("/", (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails." });
  }

  const newProduct = {
    id: uuid.v4(),
    title,
    description,
    code,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    thumbnails: thumbnails || [],
    status: true,
  };

  const products = loadProducts();
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// 🔹 Actualizar un producto existente
router.put("/:pid", (req, res) => {
  const { pid } = req.params;
  const updatedData = req.body;
  let products = loadProducts();

  const productIndex = products.findIndex((product) => product.id === pid);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  updatedData.id = pid;
  products[productIndex] = { ...products[productIndex], ...updatedData };

  saveProducts(products);
  res.json(products[productIndex]);
});

// 🔹 Eliminar un producto
router.delete("/:pid", (req, res) => {
  const { pid } = req.params;
  let products = loadProducts();

  const productExists = products.some((product) => product.id === pid);

  if (!productExists) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  const updatedProducts = products.filter((product) => product.id !== pid);

  saveProducts(updatedProducts);
  res.json({ message: `✅ Producto con ID ${pid} eliminado exitosamente.` });
});

module.exports = router;
