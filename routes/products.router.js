const express = require("express");
const router = express.Router();
const uuid = require('uuid');

let products = [
{ id: uuid.v4(), name: "Producto 1", price: 250 },
{ id: uuid.v4(), name: "Producto 2", price: 300 },
];

router.get("/", (req, res) => {
  res.render("realTimeProducts", { products });
});

router.post("/addProduct", (req, res) => {
  const { productName, productPrice } = req.body;

  const newProduct = {
    id: uuid.v4(),
    name: productName,
    price: parseFloat(productPrice),
  };

  products.push(newProduct);
  io.emit("updateProducts", products);

  res.redirect("/realtimeproducts");
});

router.get("/getProducts", (req, res) => {
  res.json(products);
});

router.delete("/deleteProduct/:id", (req, res) => {
  const productId = req.params.id;

  const index = products.findIndex((product) => product.id === productId);

  if (index !== -1) {
    products.splice(index, 1);
    io.emit("updateProducts", products);
    res.json({ success: true, message: "Producto eliminado exitosamente." });
  } else {
    res
      .status(404)
      .json({ success: false, message: "Producto no encontrado." });
  }
});

module.exports = router;

module.exports.getProducts = () => products;
