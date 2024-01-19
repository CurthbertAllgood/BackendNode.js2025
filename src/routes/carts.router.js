//ruta post crea un nuevo carrito con la siguiente estructura(id autoincremental, products:array)

// ruta get lista todos los productos dentro del carrito con el parametro cid proporcionado

// la ruta post/:cid/product/:pid --> agrega un producto al array del carrito bajo el siguiente formato(product: solo debe contener el id del producto, quantity: numero de ejemplares que sumaste al carrito de ese pid, si el pid ya existe en el array debe sumar +1 al pid en quantity)



const express = require('express');
const router = express.Router();
const ProductManager = require("../ProductManager");

const productManager = new ProductManager("products.json");
const cartManager = new ProductManager("carts.json"); // Puedes utilizar el mismo ProductManager para el carrito si lo prefieres

// POST /api/cart
router.post('/', async (req, res) => {
    try {
        // Crea un nuevo carrito con la estructura proporcionada
        const newCart = { id: cartManager.getProducts().length + 1, products: [] };
        cartManager.addProduct(newCart);
        res.json({ cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/cart/:cid
router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid, 10);

    if (isNaN(cartId) || cartId <= 0) {
        res.status(400).json({ error: 'Invalid cart ID' });
        return;
    }

    try {
        // Obtiene el carrito con el ID proporcionado
        const cart = await cartManager.getProductById(cartId);

        if (cart) {
            res.json({ cart });
        } else {
            res.json({ message: 'El ID del carrito no fue encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/cart/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);

    if (isNaN(cartId) || cartId <= 0 || isNaN(productId) || productId <= 0) {
        res.status(400).json({ error: 'Invalid cart or product ID' });
        return;
    }

    try {
        // Obtén el carrito con el ID proporcionado
        const cart = await cartManager.getProductById(cartId);

        if (!cart) {
            res.status(404).json({ message: 'El ID del carrito no fue encontrado' });
            return;
        }

        // Verifica si el producto ya existe en el carrito
        const existingProduct = cart.products.find(product => product.id === productId);

        if (existingProduct) {
            // Si el producto ya existe, incrementa la cantidad
            existingProduct.quantity += 1;
        } else {
            // Si el producto no existe, agrégalo al carrito con cantidad 1
            cart.products.push({ id: productId, quantity: 1 });
        }

        // Actualiza el carrito en el archivo
        cartManager.updateProduct(cartId, cart);

        res.json({ cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
