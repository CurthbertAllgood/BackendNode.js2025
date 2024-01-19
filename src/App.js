const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const ProductManager = require("./ProductManager");
const productManager = new ProductManager("products.json");

const CartManager = require("./ProductManager"); // Puedes usar el mismo ProductManager para el carrito si lo prefieres
const cartManager = new CartManager("carts.json");

// Rutas relacionadas con productos
app.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);

        if (!isNaN(limit) && limit >= 0) {
            const products = await productManager.getProducts();
            res.json({ products: products.slice(0, limit) });
        } else {
            res.status(400).json({ error: 'Invalid limit parameter' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
    }

    const product = await productManager.getProductById(productId);

    if (product) {
        res.json({ product });
    } else {
        res.json({ message: 'El ID del producto no fue encontrado' });
    }
});

// Rutas relacionadas con el carrito
app.use('/cart', require('./routes/carts.router'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
