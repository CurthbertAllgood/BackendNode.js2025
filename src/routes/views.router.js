const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const router = express.Router();

// Extraer usuario desde JWT
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

// Login view
router.get("/login", (req, res) => {
  res.render("login", { title: "Iniciar Sesión" });
});

// Register view
router.get("/register", (req, res) => {
  res.render("register", { title: "Registro de Usuario" });
});

// Home view con productos y usuario (si existe)
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

// Vista realTimeProducts
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real",
      products
    });
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;