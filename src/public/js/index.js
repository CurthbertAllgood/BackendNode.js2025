const socket = io();

// 🔹 Cargar productos y carrito al inicio
window.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    recuperarCarrito();
});

// 🔹 Cargar productos desde el backend
function cargarProductos(query = "") {
    fetch(`/api/products${query}`)
        .then(res => res.json())
        .then(data => actualizarListaProductos(data.payload));
}

// 🔹 Aplicar filtros
document.getElementById("applyFilters").addEventListener("click", aplicarFiltros);

function aplicarFiltros() {
    const category = document.getElementById("categoryFilter").value;
    const availability = document.getElementById("availabilityFilter").value;
    const sort = document.getElementById("sortFilter").value;

    let query = "?";
    if (category) query += `category=${category}&`;
    if (availability !== "") query += `available=${availability}&`;
    if (sort) query += `sort=${sort}&`;

    cargarProductos(query);
}

// 🔹 Agregar producto
document.getElementById("addProductBtn")?.addEventListener("click", () => {
    const name = document.getElementById("productTitle").value;
    const description = document.getElementById("productDescription").value;
    const price = document.getElementById("productPrice").value;
    const stock = document.getElementById("productStock").value;
    const category = document.getElementById("productCategory").value;
    const image = document.getElementById("productImage").value || "default.jpg";

    if (!name || !description || !price || !stock || !category) {
        alert("Todos los campos son obligatorios, excepto la imagen.");
        return;
    }

    const newProduct = { name, description, price, stock, category, image };
    socket.emit("addProduct", newProduct);
});

// 🔹 Escuchar confirmación desde el backend
socket.on("productAdded", () => {
    cargarProductos();
});

// 🔹 Manejo de eventos en botones dinámicos
function asignarEventosBotones() {
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.onclick = (event) => {
            const cartId = localStorage.getItem("cartId");
            const productId = event.target.dataset.productId;

            if (cartId) {
                socket.emit("addToCart", { cartId, productId });
            } else {
                fetch("/api/carts", { method: "POST" })
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem("cartId", data._id);
                        socket.emit("addToCart", { cartId: data._id, productId });
                    });
            }
        };
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = (event) => {
            const productId = event.target.dataset.productId;
            if (confirm("¿Seguro que deseas eliminar este producto?")) {
                socket.emit("deleteProduct", productId);
            }
        };
    });

    document.querySelectorAll(".remove-from-cart").forEach(btn => {
        btn.onclick = (event) => {
            const cartId = localStorage.getItem("cartId");
            const productId = event.target.dataset.productId;
            if (cartId) {
                socket.emit("removeFromCart", { cartId, productId });
            }
        };
    });
}

// 🔹 Guardar carrito
function guardarCarrito() {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
        alert("❌ No hay un carrito activo para guardar.");
        return;
    }

    fetch(`/api/carts/${cartId}/save`, { method: "PUT" })
        .then(res => res.json())
        .then(result => {
            if (result.error) throw new Error(result.error);
            alert("✅ Carrito guardado con éxito.");
            localStorage.removeItem("cartId");
            actualizarCarrito({ products: [] });
        })
        .catch(error => {
            alert(`❌ Error al guardar el carrito: ${error.message}`);
            console.error(error);
        });
}

document.getElementById("saveCart")?.addEventListener("click", guardarCarrito);

// 🔹 Mostrar carrito vacío
function actualizarCarritoVacio() {
    document.getElementById("cartList").innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
    document.getElementById("cartItemCount").innerText = "0";
}

// 🔹 Modal de detalles del producto
function asignarEventosImagenes() {
    document.querySelectorAll(".product-image").forEach(img => {
        img.onclick = (event) => {
            const product = JSON.parse(event.target.getAttribute("data-product"));
            const modalBody = document.getElementById("productDetailBody");
            modalBody.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="img-fluid mb-3">
                <h5>${product.name}</h5>
                <p><strong>Precio:</strong> $${product.price}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Categoría:</strong> ${product.category}</p>
                <p><strong>Descripción:</strong> ${product.description}</p>
            `;
        };
    });
}

// 🔹 Actualizar lista de productos
socket.on("updateProducts", (products) => actualizarListaProductos(products));

function actualizarListaProductos(products) {
    const productList = document.getElementById("productList");
    productList.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-success add-to-cart" data-product-id="${product._id}">Agregar al Carrito</button>
                <button class="btn btn-danger delete-btn" data-product-id="${product._id}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    asignarEventosBotones();
}

// 🔹 Actualizar contenido del carrito y contador
socket.on("updateCart", (cart) => actualizarCarrito(cart));

function actualizarCarrito(cart) {
    const cartList = document.getElementById("cartList");
    const cartItemCount = document.getElementById("cartItemCount");

    const totalItems = cart.products.reduce((acc, item) => acc + item.quantity, 0);

    if (cart.products.length === 0) {
        cartList.innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
    } else {
        cartList.innerHTML = cart.products.map(item => `
            <tr>
                <td>${item.productId?.name || "Producto desconocido"}</td>
                <td>${item.quantity}</td>
                <td>
                    <button class="btn btn-danger remove-from-cart" data-product-id="${item.productId?._id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    if (cartItemCount) {
        cartItemCount.innerText = totalItems.toString();
    }

    asignarEventosBotones();
}

// 🔹 Recuperar carrito al recargar
function recuperarCarrito() {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return;

    fetch(`/api/carts/${cartId}`)
        .then(res => res.json())
        .then(cart => actualizarCarrito(cart))
        .catch(() => localStorage.removeItem("cartId"));
}

// 🔹 Alerta de stock
socket.on("stockUnavailable", ({ productName }) => {
    alert(`❌ ${productName} no tiene stock disponible.`);
});

// 🔄 Inicializar botones
asignarEventosBotones();
