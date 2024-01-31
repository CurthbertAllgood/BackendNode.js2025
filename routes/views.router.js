const express = require('express');
const router = express.Router();
const productsRouter = require("./products.router");

router.get("/", (req, res) => {
    res.render("home",  { products: productsRouter.getProducts() });
});

router.use("/realtimeproducts", productsRouter);

module.exports = router;