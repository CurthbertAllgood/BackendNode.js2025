# Desafío Backend - Primera Entrega

## Requisitos previos

- Tener el servidor corriendo en `http://localhost:8080`
- Tener MongoDB Atlas correctamente configurado y conectado
- Tener un archivo `.env` con al menos estas variables:

```
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<baseDeDatos>
PORT=8080
SESSION_SECRET=clave_super_secreta_123
```

---

## Endpoints disponibles

### 1. Obtener todos los productos

**GET** `/api/products`

Opcional: filtros por categoría, disponibilidad y orden por precio.

Ejemplo:  
`GET /api/products?category=Audio&available=true&sort=asc`

---

### 2. Crear un nuevo producto

**POST** `/api/products`

**Body (JSON):**

```
{
  "name": "Silla Gamer",
  "description": "Silla gamer re cheta",
  "price": 250,
  "stock": 10,
  "category": "Accesorios",
  "image": "https://i.postimg.cc/HsYtQFNX/silla-gamer.png"
}
```

> Podés omitir el campo `image` para usar uno por defecto.

---

### 3. Crear un nuevo carrito

**POST** `/api/carts`

Respuesta: objeto con el ID del carrito creado.

---

### 4. Agregar un producto al carrito

**POST** `/api/carts/:cid/product/:pid`

Reemplazar `:cid` por el ID del carrito y `:pid` por el ID del producto.

---

### 5. Ver un carrito por ID

**GET** `/api/carts/:cid`

---

### 6. Guardar el carrito (finalizar compra)

**PUT** `/api/carts/:cid/save`

- Guarda el carrito y evita seguir agregando productos.
- Lanza error si el carrito está vacío.

---

### 7. Vaciar un carrito

**DELETE** `/api/carts/:cid`

---

### 8. Eliminar un producto del carrito

**DELETE** `/api/carts/:cid/product/:pid`

---

### 9. Registrar usuario

**POST** `/api/sessions/register`

**Body (JSON):**

```
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "Juan@prueba.com",
  "age": 23,
  "password": "123456"
}
```

---

### 10. Login de usuario

**POST** `/api/sessions/login`

**Body (JSON):**

```
{
  "email": "carlos@prueba.com",
  "password": "123asd"
}
```

---

### 11. Obtener usuario actual

**GET** `/api/sessions/current`

> Requiere cookie JWT. Si usás Postman, habilitá las cookies.

---

### 12. Cerrar sesión

**GET** `/logout`

- Elimina la cookie JWT.
- Redirige al home (`/`).
- Bloquea acceso a `/api/sessions/current` hasta volver a loguearse.

---

## Funcionalidades de Mocking

### 13. Generar usuarios y mascotas falsas

**POST** `/api/mocks/generateData`

**Body (JSON):**

```
{
  "users": 5,
  "pets": 8
}
```

- Inserta usuarios y mascotas en MongoDB.
- Cada mascota es asignada aleatoriamente a un usuario.

---

### 14. Obtener usuarios mockeados (en memoria)

**GET** `/api/mocks/mockingusers`

- Devuelve usuarios generados en memoria.
- No se guardan en MongoDB.

---

### 15. Obtener mascotas insertadas (con dueño)

**GET** `/api/mocks/pets`

- Devuelve todas las mascotas insertadas.
- Incluye nombre, especie, edad y datos del dueño (nombre, apellido, email).

---

### 16. Obtener usuarios insertados

**GET** `/api/mocks/users`

- Devuelve todos los usuarios guardados en MongoDB.

---

## Instalación rápida del proyecto

1. Cloná el repositorio
2. Instalá dependencias:

```
npm install
```

3. Ejecutá el servidor en modo desarrollo:

```
npm run dev
```

---

## Autor

Carlos Ortiz Cáceres  
Entrega correspondiente al Proyecto Final - Backend Coderhouse
