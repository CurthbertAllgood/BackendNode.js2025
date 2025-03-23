const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const router = express.Router();

// Middleware para extraer el usuario desde la cookie JWT
function getUserFromToken(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;
  } catch (error) {
    res.locals.user = null;
  }

  next();
}

// Ruta para la vista de login
router.get("/login", (req, res) => {
  res.render("login", { title: "Iniciar Sesión" });
});

// Ruta para la vista de registro
router.get("/register", (req, res) => {
  res.render("register", { title: "Registro de Usuario" });
});

// Ruta para la vista principal
router.get("/", getUserFromToken, async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("home", {
      title: "Inicio",
      products,
      user: res.locals.user
    });
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
