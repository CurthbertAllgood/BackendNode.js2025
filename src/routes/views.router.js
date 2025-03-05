const express = require("express");
const Product = require("../models/Product"); // Cargar productos desde MongoDB
const router = express.Router();

// Ruta para la vista principal
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean(); // Obtener productos desde MongoDB
    res.render("home", { title: "Inicio", products });
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para la vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", { title: "Productos en Tiempo Real", products });
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
