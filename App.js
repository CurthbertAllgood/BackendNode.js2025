const express = require('express')
const app = express()

const ProductManager = require("./ProductManager")

const productManager = new ProductManager("products.json");

app.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);

        if (!isNaN(limit) && limit > 0) {
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});