const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const ProductManager = require("./ProductManager");
const productManager = new ProductManager("products.json");

const CartManager = require("./ProductManager");
const cartManager = new CartManager("carts.json");

// Rutas relacionadas con productos
app.use('/api/products', require('./routes/api/products.router')); // Utiliza el enrutador de productos

// Rutas relacionadas con el carrito
app.use('/cart', require('./routes/api/carts.router'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
