// src/controllers/purchase.controller.js

const cartRepository = require("../dao/repositories/cart.repository");
const productRepository = require("../dao/repositories/product.repository");
const ticketRepository = require("../dao/repositories/ticket.repository");
const UserDTO = require("../dto/User.dto");
const TicketDTO = require("../dto/Ticket.dto");

const purchaseCart = async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    let amount = 0;
    const productsNotProcessed = [];
    const productsToKeep = [];

    for (const item of cart.products) {
      const product = await productRepository.getProductById(item.productId._id);
      if (!product) continue;

      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        amount += product.price * item.quantity;
        await productRepository.saveProduct(product);
      } else {
        productsNotProcessed.push({
          product: product._id,
          reason: "Stock insuficiente",
        });
        productsToKeep.push(item);
      }
    }

    const purchaser = new UserDTO(req.user).email;
    const ticket = await ticketRepository.createTicket({ amount, purchaser });
    const responseTicket = new TicketDTO(ticket);

    cart.products = productsToKeep;
    cart.saved = true;
    await cartRepository.saveCart(cart);

    res.status(200).json({
      message: "✅ Compra procesada",
      ticket: responseTicket,
      productosNoProcesados: productsNotProcessed,
    });
  } catch (error) {
    console.error("❌ Error en compra:", error);
    res.status(500).json({ error: "Error al procesar la compra" });
  }
};

module.exports = {
  purchaseCart
};
