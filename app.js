const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const httpServer = app.listen(8080, () =>
  console.log("✅ Server running at http://127.0.0.1:8080")
);
const io = new Server(httpServer);

// Importar routers
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router"); // Asegurar que se está importando bien
const viewsRouter = require("./routes/views.router");

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter); // Asegurar que esté bien registrado

// Cargar productos desde JSON
const loadProducts = () => {
  const filePath = path.join(__dirname, "data/productos.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Socket.io para productos en tiempo real
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado");

  socket.on("addProduct", (newProduct) => {
    const products = loadProducts();
    newProduct.id = uuidv4();
    products.push(newProduct);
    fs.writeFileSync("data/productos.json", JSON.stringify(products, null, 2));

    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (productId) => {
    let products = loadProducts();
    products = products.filter((product) => product.id !== productId);
    fs.writeFileSync("data/productos.json", JSON.stringify(products, null, 2));

    io.emit("updateProducts", products);
    io.emit("productDeleted", productId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado");
  });
});
