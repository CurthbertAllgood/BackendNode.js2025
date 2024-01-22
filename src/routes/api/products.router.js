const express = require('express');
const router = express.Router();
const ProductManager = require("../../ProductManager");

const productManager = new ProductManager("products.json");

// GET /api/products?limit=x
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);
        const products = await productManager.getProducts();

        if (!isNaN(limit) && limit > 0) {
            res.json({ products: products.slice(0, limit) });
        } else {
            res.json({ products });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'El id del producto es invalido' });
        return;
    }

    try {
        const product = await productManager.getProductById(productId);

        if (product) {
            res.json({ product });
        } else {
            res.json({ message: 'El ID del producto no fue encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { title, description, code, number, status = true, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !number || !stock || !category) {
            res.status(400).json({ error: 'falta rellenar campos requeridos' });
            return;
        }

        const newProduct = await productManager.addProduct(title, description, code, number, status, stock, category, thumbnails);
        res.status(201).json({ product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/products/:id


// PUT /api/products/:id
// PUT /api/products/:id
router.put('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
    }

    try {
        const { title, description, code, number, status, stock, category, thumbnails } = req.body;
        const existingProduct = await productManager.getProductById(productId);

        if (!existingProduct) {
            res.json({ message: 'El ID del producto no fue encontrado' });
            return;
        }

        const updatedProduct = await productManager.updateProduct(productId, { title, description, code, number, status, stock, category, thumbnails });

        if (updatedProduct && isProductChanged(existingProduct, updatedProduct)) {
            res.json({ message: `El producto con ID ${productId} fue modificado`, product: updatedProduct });
        } else {
            res.json({ message: 'No se realizaron cambios en el producto con ID ' + productId, product: existingProduct });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Función para verificar si un producto ha cambiado
function isProductChanged(oldProduct, newProduct) {
    return (
        oldProduct.title !== newProduct.title ||
        oldProduct.description !== newProduct.description ||
        oldProduct.code !== newProduct.code ||
        oldProduct.number !== newProduct.number ||
        oldProduct.status !== newProduct.status ||
        oldProduct.stock !== newProduct.stock ||
        oldProduct.category !== newProduct.category ||
        oldProduct.thumbnails !== newProduct.thumbnails
    );
}


// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
    }

    try {
        const deletedProduct = await productManager.deleteProduct(productId);

        if (deletedProduct) {
            res.json({ message: 'Producto eliminado con éxito' });
        } else {
            res.json({ message: 'El ID del producto no fue encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
