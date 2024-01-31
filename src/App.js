import express from "express";
import prodManager from "./controllers/ProductManager.js";
import routersProducts from "./routes/api/products.router.js";
import routerViews from "./routes/api/views.router.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";

const app = express();
const httpServer = app.listen(8080, () => {
    console.log(`server http://localhost:${8080}`);
});

//CONFIGURACIONES
//Socket.io
const socketServer = new Server(httpServer);
//Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());

//ROUTES
app.use("/api/products", routersProducts);

//VISTAS
app.use("/", routerViews);

//SOCKET.IO
socketServer.on("connection", (socket) => {
    console.log("Un cliente se ha conectado");
    socket.on("postProduct", async (data) => {
        console.log("Evento postProduct recibido en el servidor", data);
        await prodManager.addProduct(data);
        socketServer.emit("postProduct", data);
        socketServer.emit("recibirProductos", prodManager.getProducts());
    });
    socket.emit("recibirProductos", prodManager.getProducts());
});