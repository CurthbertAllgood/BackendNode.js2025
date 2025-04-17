// src/routes/purchase.router.js

const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = passport.authenticate("current", { session: false });

const { purchaseCart } = require("../controllers/purchase.controller");
const { authorization } = require("../middlewares/authorization");

// Solo usuarios autenticados con rol "user" pueden comprar
router.post("/:cid/purchase", auth, authorization(["user"]), purchaseCart);

module.exports = router;
