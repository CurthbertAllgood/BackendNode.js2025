// src/routes/sessions.router.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { createHash } = require("../utils/hash");
const CartRepository = require("../repositories/cart.repository");
const User = require("../models/User");
const UserDTO = require("../dto/User.dto");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "Usuario ya registrado" });
    }

    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
    });

    await newUser.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno en el registro" });
  }
});



// Login con merge de carrito
router.post("/login", (req, res, next) => {
  console.log("🔍 SESSION CART en login:", JSON.stringify(req.session.cart, null, 2));
  const sessionCart = req.session.cart || [];

  passport.authenticate("login", { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    try {
      const token = jwt.sign(
        {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("jwt", token, { httpOnly: true });

      let userCart = await CartRepository.getActiveCartByUserId(user._id);
      if (!userCart) {
        userCart = await CartRepository.createCart(user._id);
      }

      if (sessionCart.length > 0) {
        await CartRepository.mergeSessionCartToUser(userCart, sessionCart);
        req.session.cart = []; // limpia el carrito de sesión
      }

      res.json({
        message: "Login exitoso",
        cartId: userCart._id,
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ error: "Error interno en el login" });
    }
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

// Usuario actual
router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  const safeUser = new UserDTO(req.user);
  res.status(200).json({ user: safeUser });
});

module.exports = router;