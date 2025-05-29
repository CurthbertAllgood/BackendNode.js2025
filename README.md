# Desafío Backend - Primera Entrega

## Requisitos previos

- Tener el servidor corriendo en `http://localhost:8080`
- Tener MongoDB Atlas correctamente configurado y conectado
- Tener un archivo `.env` con al menos estas variables:

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<baseDeDatos>
PORT=8080
SESSION_SECRET=clave_super_secreta_123
Endpoints disponibles
1. Obtener todos los productos
GET /api/products

Opcional: filtros por categoría, disponibilidad y orden por precio:

http
Copiar
Editar
GET /api/products?category=Audio&available=true&sort=asc
2. Crear un nuevo producto
POST /api/products

Body (JSON):

json
Copiar
Editar
{
  "name": "Silla Gamer",
  "description": "Silla gamer re cheta",
  "price": 250,
  "stock": 10,
  "category": "Accesorios",
  "image": "https://i.postimg.cc/HsYtQFNX/silla-gamer.png"
}
Nota: podés omitir el campo image para usar uno por defecto.

3. Crear un nuevo carrito
POST /api/carts

Respuesta: objeto con el ID del carrito creado.

4. Agregar un producto al carrito
POST /api/carts/:cid/product/:pid

Reemplazar :cid por el ID del carrito y :pid por el ID del producto.

5. Ver un carrito por ID
GET /api/carts/:cid

6. Guardar el carrito (finalizar compra)
PUT /api/carts/:cid/save

Guarda el carrito y evita seguir agregando productos.

Lanza error si el carrito está vacío.

7. Vaciar un carrito
DELETE /api/carts/:cid

8. Eliminar un producto del carrito
DELETE /api/carts/:cid/product/:pid

9. Registrar usuario
POST /api/sessions/register

Body (JSON):

json
Copiar
Editar
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "Juan@prueba.com",
  "age": 23,
  "password": "123456"
}
10. Login de usuario
POST /api/sessions/login

Body (JSON):

json
Copiar
Editar
{
  "email": "carlos@prueba.com",
  "password": "123asd"
}
11. Obtener usuario actual
GET /api/sessions/current

Requiere cookie JWT. Si usás Postman, asegurate de habilitar las cookies.

12. Cerrar sesión (logout)
GET /logout

Elimina la cookie JWT.

Redirige al home (/).

Bloquea el acceso a /api/sessions/current hasta volver a loguearse.

Funcionalidades de Mocking
13. Generar usuarios y mascotas falsas
POST /api/mocks/generateData

Body (JSON):

json
Copiar
Editar
{
  "users": 5,
  "pets": 8
}
Inserta en la base de datos los registros indicados.

Las mascotas son asignadas aleatoriamente a un usuario como owner.

14. Obtener usuarios mockeados (en memoria)
GET /api/mocks/mockingusers

Devuelve una lista de usuarios generados en memoria (sin guardarlos en Mongo).

Útil para probar estructura o formato sin persistencia.

15. Obtener mascotas insertadas (con dueños)
GET /api/mocks/pets

Lista todas las mascotas guardadas en Mongo.

Incluye información del dueño (first_name, last_name, email) vía populate.

16. Obtener usuarios insertados
GET /api/mocks/users

Lista todos los usuarios guardados en Mongo.

Útil para verificar el resultado de /generateData.

Instalación rápida del proyecto
bash
Copiar
Editar
npm install
npm run dev
Verificar que el archivo .env esté correctamente configurado antes de ejecutar.

Autor
Carlos Ortiz Cáceres
Entrega correspondiente al Proyecto Final - Backend Coderhouse
