// import prodManager from "../controllers/ProductManager.js";
import __dirname from "../../utils.js";
import express, { response } from "express";

const router = express.Router();

router.get("/home", (req, res) => {
    fetch("http://localhost:8080/api/products")
        .then((response) => response.json())
        .then((data) => {
            res.render("home", {
                style: "home.css",
                title: "Home",
                data,
            });
        });
});

router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", {
        style: "realtimeproducts.css",
        title: "Realtime Products",
    });
});
export default router;