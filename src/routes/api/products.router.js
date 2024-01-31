import express from "express";
import prodManager from "../../controllers/ProductManager.js";
import { validarDatos } from "../../middlewares/middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
    const limit = req.query.limit;
    if (limit) {
        let productos = prodManager.getLimitProducts(parseInt(limit));
        res.send(productos);
    } else {
        res.send(prodManager.getProducts());
    }
});

router.get("/:id", async (req, res) => {
    const product = await prodManager.getProductsById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(404).send("Producto no encontrado");
    }
});

router.post("/", validarDatos, async (req, res) => {
    console.log(req.body);
    const prods = await prodManager.addProduct(req.body);
    if (prods.existe) {
        res.status(400).send(prods.mensaje);
    }
    res.status(201).send(prods.mensaje);
});

router.delete("/:id", async (req, res) => {
    await prodManager.deleteProduct(req.params.id);
    res.send("Producto eliminado");
});

export default router;