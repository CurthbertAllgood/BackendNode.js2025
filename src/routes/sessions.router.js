// src/routes/sessions.router.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { createHash } = require("../utils/hash");
const User = require("../models/User");
const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  const exist = await User.findOne({ email });
  if (exist) return res.status(400).json({ error: "Usuario ya registrado" });

  const newUser = new User({
    first_name,
    last_name,
    email,
    age,
    password: createHash(password),
  });

  await newUser.save();
  res.redirect("/");

});

// Login
router.post("/login", passport.authenticate("login", { session: false }), (req, res) => {
  const user = req.user;

  const token = jwt.sign(
    {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("jwt", token, { httpOnly: true }).json({ message: "Login exitoso" });
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt"); 
  res.redirect("/"); 
});


// Ruta current (usuario logueado)
router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
