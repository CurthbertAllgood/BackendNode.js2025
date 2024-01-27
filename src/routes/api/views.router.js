const express = require('express');
const router = express.Router();
const productsRouter = require("./products.router");  // No se exporta productsArray, solo importa el router

module.exports = (io) => {
    router.get("/", (req, res) => {
        res.render("home", { products: productsRouter.productsArray });
    });

    return router;
};
