// products.router.js
const express = require("express");
const router = express.Router();
const uuid = require('uuid');

// Cambio: Agrega io como parámetro al router
module.exports = (io) => {
    let productsArray = [
        { id: uuid.v4(), name: "Producto 1", price: 250 },
        { id: uuid.v4(), name: "Producto 2", price: 300 },
    ];

    router.get("/", (req, res) => {
        res.render("realTimeProducts", { products: productsArray });
    });

    router.post("/addProduct", (req, res) => {
        const { productName, productPrice } = req.body;

        const newProduct = {
            id: uuid.v4(),
            name: productName,
            price: parseFloat(productPrice),
        };

        productsArray.push(newProduct);

        io.emit("updateProducts", productsArray);

        res.redirect("/realtimeproducts");
    });

    router.get("/getProducts", (req, res) => {
        res.json(productsArray);
    });

    router.delete("/deleteProduct/:id", (req, res) => {
        const productId = req.params.id;

        const index = productsArray.findIndex((product) => product.id === productId);

        if (index !== -1) {
            productsArray.splice(index, 1);

            // Cambio: Emitir el evento a través de la instancia de io
            io.emit("updateProducts", productsArray);

            res.json({ success: true, message: "Producto eliminado exitosamente." });
        } else {
            res
                .status(404)
                .json({ success: false, message: "Producto no encontrado." });
        }
    });

    // Cambio: Exporta el router configurado con io
    return router;
};
