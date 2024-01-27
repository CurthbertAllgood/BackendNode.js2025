const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const productsRouter = require("./routes/api/products.router");

const httpServer = app.listen(8080, () => console.log('Server running in port http://127.0.0.1:8080'));

const io = new Server(httpServer);

app.engine(
    "handlebars",
    handlebars.engine({ extname: "hbs", defaultLayout: "", layoutsDir: "" })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const viewsRouter = require("./routes/api/views.router")(io);  // Pasa io directamente
app.use("/", viewsRouter);


app.use("/realtimeproducts", require("./routes/api/products.router")(io));

io.on("connection", (socket) => {
    console.log("Usuario conectado");

    socket.on("addProduct", (product) => {
        productsRouter.productsArray.push(product);
        io.emit("updateProducts", productsRouter.productsArray);
    });

    socket.on("deleteProduct", (productId) => {
        const index = productsRouter.productsArray.findIndex((product) => product.id === productId);

        if (index !== -1) {
            productsRouter.productsArray.splice(index, 1);
            io.emit("updateProducts", productsRouter.productsArray);
        }
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });
});
