// src/routes/carts.router.js

const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = passport.authenticate("current", { session: false });

const {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  clearCart,
  decreaseQuantity // ✅ Agregado
} = require("../controllers/cart.controller");

router.post("/", createCart);
router.get("/:cid", getCartById);
router.post("/:cid/product/:pid", addProductToCart);
router.put("/:cid/product/:pid/decrease", decreaseQuantity); // ✅ FALTABA ESTA RUTA
router.delete("/:cid/product/:pid", removeProductFromCart);
router.delete("/:cid", clearCart);

module.exports = router;
