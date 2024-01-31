import fs from "fs";

class ProductManager {
    static id = 0;

    constructor() {
        this.productos = [];
        this.path = "src/data/products.json";
        this.addProdFile();
    }

    addProdFile = async () => {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            if (data.length !== 0) {
                this.productos = JSON.parse(data);
                ProductManager.id = this.productos[this.productos.length - 1].id + 1;
            }
        } catch (error) {
            console.log(error);
        }
    };

    addProduct = async (data) => {
        if (this.productos.length !== 0) {
            const existe = this.productos.some(
                (producto) => producto.code === data.code
            );
            if (existe === true)
                return {
                    existe: true,
                    mensaje: `Ya existe un producto con ese código ${data.code}`,
                };
        }
        this.productos.push({
            id: ProductManager.id++,
            ...data,
        });
        await fs.promises.writeFile(
            this.path,
            JSON.stringify(this.productos, null, "\t")
        );
        return { existe: false, mensaje: "Producto Agregado correctamente" };
    };

    getProducts = () => {
        if (this.productos.length === 0) return console.log("No hay Productos");
        return this.productos;
    };

    getProductsById = (ID) => {
        if (this.productos.length === 0) return console.log(this.productos);
        let prod = this.productos.find((e) => e.id == ID);
        prod.length === 0 ? console.log("Not found") : console.log(prod);
        return prod;
    };

    updateProduct = async (ID, PRODUCT) => {
        const aux = this.productos.map((prod) => {
            if (prod.id === ID) {
                prod = { id: prod.id, ...PRODUCT };
                return prod;
            }
            return prod;
        });
        this.productos = aux;
        await fs.promises.writeFile(this.path, []);
        await fs.promises.writeFile(
            this.path,
            JSON.stringify(this.productos, null, "\t")
        );
    };

    deleteProduct = async (ID) => {
        const aux = this.productos.filter((prod) => prod.id !== ID);
        this.productos = aux;
        await fs.promises.writeFile(this.path, []);
        await fs.promises.writeFile(
            this.path,
            JSON.stringify(this.productos, null, "\t")
        );
    };

    getLimitProducts = (limit) => {
        const prods = this.productos.slice(0, limit);
        return prods;
    };
}
let prodManager = new ProductManager();

export default prodManager;