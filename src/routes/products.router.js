//--> api/products


// ruta get / que lista todos los productos de la base , incluyendo la limitacion ?limit de la entrega anterior

// get:pid  parar traer el producto del id

// ruta post / que agrega productos nuevos con los campos ( id autogenerado, title, description, code, number, status= true por defecto, stock, categoria, thumbnails: unico campo no obligatorio de rellenar)

// ruta put:pid actualiza un producto ingresado, se puede actualizar todo menos el id

// delete:pid para borrar el producto con el pid indicado

const express = require('express');
const router = express.Router();
const ProductManager = require("../ProductManager");

const productManager = new ProductManager("products.json");

// GET /api/products?limit=x
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);

        if (!isNaN(limit) && limit > 0) {
            const products = await productManager.getProducts();
            res.json({ products: products.slice(0, limit) });
        } else {
            const products = await productManager.getProducts();
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

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { title, description, code, number, status = true, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !number || !stock || !category) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Utiliza el método addProduct del productManager para agregar un nuevo producto.
        const newProduct = await productManager.addProduct(title, description, code, number, status, stock, category, thumbnails);
        res.json({ product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
    }

    try {
        const { title, description, code, number, status, stock, category, thumbnails } = req.body;

        // Utiliza el método updateProduct del productManager para actualizar un producto existente.
        const updatedProduct = await productManager.updateProduct(productId, { title, description, code, number, status, stock, category, thumbnails });

        if (updatedProduct) {
            res.json({ product: updatedProduct });
        } else {
            res.json({ message: 'El ID del producto no fue encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
    }

    try {
        // Utiliza el método deleteProduct del productManager para eliminar un producto por su ID.
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
