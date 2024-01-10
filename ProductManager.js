const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.cargarProductos();
    }

    cargarProductos() {
        if (fs.existsSync('products.json')) {
            this.products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
            console.log('Productos cargados desde el archivo');
        } else {
            console.log('No se encontró el archivo de productos');
        }
    }

    saveProductsToFile() {
        fs.writeFileSync('products.json', JSON.stringify(this.products));
        console.log('Productos guardados en el archivo');
    }


    addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.log(`Todos los campos son obligatorios en el producto ${title} que esta intentando ingresar`);
            return;
        }

        const productExistence = this.products.find((product) => product.code === code);
        if (productExistence) {
            console.log(`El producto ${title} ya existe, el codigo ${code} es el mismo al del ${productExistence.title}.`);
            return;
        }else {
            const producto = {
                id: this.products.length + 1,
                title,
                description,
                price,
                thumbnail,
                code,
                stock
            };
            this.products.push(producto);
            console.log(`El producto ${producto.title} se agrego correctamente`);
        }
        this.saveProductsToFile();
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const productId = this.products.find(product => product.id === id);
        if (productId) {
            console.log(`El producto con el id ${id} fue encontrado`);
            return productId;
        } else {
            console.log(`El producto con el id ${id} no fue encontrado`);
            return null;
        }
    }

    updateProduct(id, producto) {
        const index = this.products.findIndex(prod => prod.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...producto };
            console.log(`El producto con el id ${id} fue actualizado`);
        } else {
            console.log(`El producto con el id ${id} no fue encontrado`);
        }
        this.saveProductsToFile();
    }

    deleteProduct(id) {
        const index = this.products.findIndex(prod => prod.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            console.log(`El producto con el id ${id} fue eliminado`);
        } else {
            console.log(`El producto con el id ${id} no fue encontrado`);
        }
        this.saveProductsToFile();
    }
}
//const productos = new ProductManager()
//productos.addProduct("titulo2","descripcion2",2,"imagein2",2,2)

//productos.addProduct("titulo3","descripcion3",3,"imagein3",3,3)
//productos.addProduct("titulo4","descripcion4",4,"imagein4",4,4)

//productos.addProduct("titulo5","descripcion5",5,"imagein5",5,5)

module.exports = ProductManager;

