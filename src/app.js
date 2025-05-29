// src/app.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const handlebars = require("express-handlebars");
require("dotenv").config(); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


const session = require("express-session");
const MongoStore = require("connect-mongo");
console.log("SESSION_SECRET =", process.env.SESSION_SECRET);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 // 1 hora de sesión
  })
}));


// Passport
const initializePassport = require("./config/passport.config");
initializePassport();
app.use(passport.initialize());

// Handlebars setup
const hbs = handlebars.create({
  helpers: {
    multiply: (a, b) => a * b,
    gt: (a, b) => a > b,
    eq: (a, b) => a === b
  },
  partialsDir: path.join(__dirname, "views", "partials")
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => {
  console.error("❌ Error al conectar a MongoDB Atlas:", err);
  process.exit(1);
});

// Routes
const viewsRouter = require("./routes/views.router");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const sessionRouter = require("./routes/sessions.router");
const purchaseRouter = require("./routes/purchase.router");
const mocksRouter = require("./routes/mocks.router");

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/purchase", purchaseRouter);
app.use("/api/mocks", mocksRouter);


// Make io available globally
app.set("io", io);

// Socket.io
const Product = require("./models/Product");
const Cart = require("./models/Cart");

io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado con socket.io");

  socket.on("addProduct", async (newProduct) => {
    try {
      const product = new Product(newProduct);
      await product.save();
      io.emit("updateProducts", await Product.find());
      socket.emit("productAdded", product);
    } catch (error) {
      console.error("❌ Error agregando producto:", error);
      socket.emit("addProductError", "No se pudo agregar el producto");
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      io.emit("updateProducts", await Product.find());
      io.emit("productDeleted", productId);
    } catch (error) {
      console.error("❌ Error eliminando producto:", error);
    }
  });

  socket.on("addToCart", async ({ cartId, productId }) => {
    try {
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

      const item = cart.products.find(p => p.productId._id.equals(productId));
      item ? item.quantity++ : cart.products.push({ productId: product._id, quantity: 1 });

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

  socket.on("removeFromCart", async ({ cartId, productId }) => {
    try {
      let cart = await Cart.findById(cartId).populate("products.productId");
      if (!cart) return;

      const index = cart.products.findIndex(p => p.productId._id.equals(productId));
      if (index === -1) return;

      const product = await Product.findById(productId);
      if (product) {
        product.stock += cart.products[index].quantity;
        await product.save();
      }

      cart.products.splice(index, 1);
      await cart.save();

      cart = await Cart.findById(cartId).populate("products.productId");
      io.emit("updateCart", cart);
      io.emit("updateProducts", await Product.find());
    } catch (error) {
      console.error("❌ Error en removeFromCart:", error);
    }
  });

  socket.on("clearCart", async (cartId) => {
    try {
      const cart = await Cart.findById(cartId);
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
