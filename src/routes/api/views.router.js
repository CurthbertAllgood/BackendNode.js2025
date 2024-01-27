const express = require('express');
const router = express.Router();
const productsRouter = require("./products.router");

module.exports = (io) => {
    router.get("/", (req, res) => {
        res.render("home", { products: productsRouter.productsArray });
    });

    router.use("/realtimeproducts", productsRouter);

    return router;
};
