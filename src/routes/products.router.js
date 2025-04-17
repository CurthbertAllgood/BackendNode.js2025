// src/routes/products.router.js

const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = passport.authenticate("current", { session: false });

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

const { authorization } = require("../middlewares/authorization");

router.get("/", getAllProducts);
router.get("/:pid", getProductById);
router.post("/", auth, authorization(["admin"]), createProduct);
router.put("/:pid", auth, authorization(["admin"]), updateProduct);
router.delete("/:pid", auth, authorization(["admin"]), deleteProduct);

module.exports = router;
