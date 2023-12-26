import {promises as fs} from 'fs';

class ProductManager {
    constructor() {
        this.patch = "./productos.txt";
        this.products = [];

    }

    static id = 0;
     addProduct = async (title, description, price, imagen, code, stock) => {
        ProductManager.id++

        let newProduct = {
            title,
            description,
            price,
            imagen,
            code,
            stock,
            id: ProductManager.id
        };
        this.products.push(newProduct)

        await fs.writeFile(this.patch, JSON.stringify(this.products));
    };

     getProducts = async()=>{
         let respuesta2 = await this.readProducts()
         return console.log(respuesta2)
     }

     readProducts = async()=>{
         let respuesta =await fs.readFile(this.patch, "utf-8")
         return JSON.parse(respuesta)
     }
     getProductsById= async(id)=>{
         let respuesta3 = await this.readProducts()
         if(!respuesta3.find(product => product.id ===id)){
             console.log("Producto no encontrado")
         }
         let filter = respuesta3.find(product => product.id ===id)
         console.log(filter)

     }
     deleteProductById= async (id) =>{
         let respuesta3 = await this.readProducts()
         let productFilter = respuesta3.filter(products=> products.id != id)
         await fs.writeFile(this.patch, JSON.stringify(productFilter))

     }

     updateProduct= async ({id,...producto}) =>{
        await  this.deleteProductById(id);
        let productId= await this.readProducts();
        let productModificado= [{...producto,id}, productId];
        await fs.writeFile(this.patch, JSON.stringify(productModificado));
        console.log("producto modificado");
        }
}
const productos = new ProductManager();

/*productos.addProduct("titulo1","descripcion1",1,"imagein1",1,1)
productos.addProduct("titulo2","descripcion2",2,"imagein2",2,2)

productos.addProduct("titulo3","descripcion3",3,"imagein3",3,3)
productos.addProduct("titulo4","descripcion4",4,"imagein4",4,4)

productos.addProduct("titulo5","descripcion5",5,"imagein5",5,5)
*/
//productos.deleteProductById(1)
/*productos.updateProduct({
    title:"titulo1",
    description: "descripcion1",
    price:598,
    imagen:"imagen1",
    code:1,
    stock:1,
    id:1,
});
productos.getProducts()*/