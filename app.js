const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const productsRouter = require("./routes/products.router");

const httpServer = app.listen(8080, () => console.log('Server running in port http://127.0.0.1:8080'))

const io = new Server(httpServer);

app.engine(
  "handlebars",
  handlebars.engine({ extname: "hbs", defaultLayout: "", layoutsDir: "" })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


let products = [];

const viewsRouter = require("./routes/views.router");
app.use("/", viewsRouter);


io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("addProduct", (product) => {
    productsRouter.getProducts().push(product);
    io.emit("updateProducts", productsRouter.getProducts());
  });

  socket.on("deleteProduct", (productId) => {
    // Encontrar el índice del producto con el productId
    const index = productsRouter.getProducts().findIndex((product) => product.id === productId);

    // Si se encuentra el producto, eliminarlo del array
    if (index !== -1) {
      productsRouter.getProducts().splice(index, 1);
      io.emit("updateProducts", productsRouter.getProducts());
    }
    });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});