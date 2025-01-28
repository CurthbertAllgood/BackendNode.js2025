const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const productsFile = path.join(__dirname, "../data/productos.json");

// Función para cargar productos
const loadProducts = () => {
  if (!fs.existsSync(productsFile)) return [];
  const data = fs.readFileSync(productsFile, "utf-8");
  return JSON.parse(data);
};

// Ruta para la vista principal
router.get("/", (req, res) => {
  const products = loadProducts(); // Obtiene los productos actualizados
  res.render("home", { title: "Inicio", products });
});

// Ruta para la vista de productos en tiempo real
router.get("/realtimeproducts", (req, res) => {
  const products = loadProducts();
  res.render("realTimeProducts", { title: "Productos en Tiempo Real", products });
});

module.exports = router;
