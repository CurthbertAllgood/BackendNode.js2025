## Requisitos previos

- Tener el servidor corriendo en `http://localhost:8080`
- Tener MongoDB Atlas correctamente configurado y conectado

---

## Endpoints disponibles

### 1. Obtener todos los productos

**GET** `/api/products`

**Opcional**: filtros por categoría, disponibilidad y orden por precio:

```bash
GET /api/products?category=Audio&available=true&sort=asc
```

### 2. Crear un nuevo producto (con imagen)

**POST** `/api/products`

**Body (JSON):**
```json
{
  "name": "Silla Gamer",
  "description": "Silla gamer re cheta",
  "price": 250,
  "stock": 10,
  "category": "Accesorios",
  "image": "https://i.postimg.cc/HsYtQFNX/silla-gamer.png"
}
```

Otro ejemplo:
```json
{
  "name": "Parlante Bluetooth",
  "description": "Parlante re cheto",
  "price": 120,
  "stock": 15,
  "category": "Audio",
  "image": "https://i.postimg.cc/Z52rL0tK/parlante-musica.png"
}
```

### Nota: puedes omitir el campo `image` para usar el valor por defecto._

### 3. Crear un nuevo carrito

**POST** `/api/carts`

**Respuesta:** objeto con el ID del carrito creado

---

### 4. Agregar un producto al carrito

**POST** `/api/carts/:cid/product/:pid`

Reemplaza `:cid` por el ID del carrito y `:pid` por el ID del producto. Ejemplo:
```bash
POST /api/carts/654123abcdef/product/789456ghijkl
```

---

### 5. Ver un carrito por ID

**GET** `/api/carts/:cid`

```bash
GET /api/carts/654123abcdef
```

---

### 6. Guardar el carrito (finalizar compra)

**PUT** `/api/carts/:cid/save`

Guarda el carrito y evita que se sigan agregando productos. Si está vacío, lanza un error.

---

### 7. Vaciar un carrito

**DELETE** `/api/carts/:cid`

Vacía el carrito sin eliminarlo.

---

### 8. Eliminar un producto del carrito

**DELETE** `/api/carts/:cid/product/:pid`

### 9. URL mongoDB

Si el .env no aparece, generar uno en la ruta raiz e ingresar los siguientes datos:

MONGO_URI=mongodb+srv://carlosortizcaceres2202:Fa1RvZmOGcTcjJt8@cluster0.ihirp.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
PORT=8080



