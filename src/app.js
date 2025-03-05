const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const Product = require("./models/Product");
const Cart = require("./models/Cart");

// 📌 Configurar Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const viewsRouter = require("./routes/views.router");
app.use("/", viewsRouter);

// 📌 Hacer que `io` esté disponible en `req.app`
app.set("io", io);

// 📌 Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => {
      console.error("❌ Error al conectar a MongoDB Atlas:", err);
      process.exit(1);
  });

// 📌 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// 📌 Importar rutas
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// 📌 Configurar `socket.io`
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado con socket.io");

  // 🔹 Agregar Producto
  socket.on("addProduct", async (newProduct) => {
    try {
      console.log("📩 Recibida solicitud para agregar producto:", newProduct);
      const product = new Product(newProduct);
      await product.save();
      io.emit("updateProducts", await Product.find());
      socket.emit("productAdded", product);
    } catch (error) {
      console.error("❌ Error agregando producto:", error);
      socket.emit("addProductError", "No se pudo agregar el producto");
    }
  });

  // 🔹 Actualizar Producto
  socket.on("updateProduct", async ({ productId, productData }) => {
    try {
      console.log("✏️ Actualizando producto:", productId, productData);
      const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
      if (!updatedProduct) {
        console.log("❌ Error: Producto no encontrado");
        socket.emit("updateProductError", "Producto no encontrado");
        return;
      }
      console.log("✅ Producto actualizado:", updatedProduct);
      io.emit("updateProducts", await Product.find());
      socket.emit("productUpdated", updatedProduct);
    } catch (error) {
      console.error("❌ Error actualizando producto:", error);
      socket.emit("updateProductError", "No se pudo actualizar el producto");
    }
  });

  // 🔹 Eliminar Producto
  socket.on("deleteProduct", async (productId) => {
    try {
      console.log(`🗑️ Eliminando producto con ID: ${productId}`);
      await Product.findByIdAndDelete(productId);
      io.emit("updateProducts", await Product.find());
      io.emit("productDeleted", productId);
    } catch (error) {
      console.error("❌ Error eliminando producto:", error);
    }
  });

  // 🔹 Manejar el carrito
  socket.on("addToCart", async ({ cartId, productId }) => {
    try {
      console.log("📩 Agregando producto al carrito:", { cartId, productId });

      let cart = await Cart.findById(cartId).populate("products.productId");
      const product = await Product.findById(productId);

      if (!cart) {
        cart = new Cart({ products: [] });
        await cart.save();
        cartId = cart._id;
        socket.emit("cartCreated", { cartId });
      }

      if (!product || product.stock <= 0) {
        socket.emit("stockUnavailable", { productName: product ? product.name : "Desconocido" });
        return;
      }

      let item = cart.products.find(p => p.productId._id.equals(productId));
      if (item) {
        item.quantity++;
      } else {
        cart.products.push({ productId: product._id, quantity: 1 });
      }
      product.stock--;
      await product.save();
      await cart.save();

      cart = await Cart.findById(cartId).populate("products.productId");
      io.emit("updateCart", cart);
      io.emit("updateProducts", await Product.find());
    } catch (error) {
      console.error("❌ Error en addToCart:", error);
    }
  });

  // 🔹 Eliminar Producto del Carrito
  socket.on("removeFromCart", async ({ cartId, productId }) => {
    try {
      let cart = await Cart.findById(cartId).populate("products.productId");
      if (!cart) return;

      const itemIndex = cart.products.findIndex(item => item.productId._id.equals(productId));
      if (itemIndex === -1) return;

      const product = await Product.findById(productId);
      if (product) {
        product.stock += cart.products[itemIndex].quantity;
        await product.save();
      }

      cart.products.splice(itemIndex, 1);
      await cart.save();

      io.emit("updateCart", cart);
      io.emit("updateProducts", await Product.find());
    } catch (error) {
      console.error("❌ Error en removeFromCart:", error);
    }
  });

  // 🔹 Vaciar Carrito
  socket.on("clearCart", async (cartId) => {
    try {
      let cart = await Cart.findById(cartId);
      if (!cart) return;
      cart.products = [];
      await cart.save();
      io.emit("updateCart", cart);
      socket.emit("cartCleared");
    } catch (error) {
      console.error("❌ Error en clearCart:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado");
  });
});

server.listen(8080, () => {
  console.log("✅ Servidor corriendo en http://127.0.0.1:8080");
});
