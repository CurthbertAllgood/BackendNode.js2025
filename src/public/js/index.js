const socket = io();

window.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    recuperarCarrito();
    interceptarLoginForm();


    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("compraPendiente") === "true") {
        chequearCompraPendiente();
    }
    
});



function cargarProductos(query = "") {
    fetch(`/api/products${query}`)
        .then(res => res.json())
        .then(data => actualizarListaProductos(data.payload));
}

function interceptarLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        const cartId = localStorage.getItem("cartId");
        let cart = [];

        if (cartId) {
            try {
                const res = await fetch(`/api/carts/${cartId}`);
                const cartData = await res.json();
                cart = cartData.products.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity
                }));
            } catch (err) {
                console.warn("⚠️ No se pudo cargar el carrito local:", err);
            }
        }

        try {
            const res = await fetch("/api/sessions/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, cart })
            });

            if (!res.ok) {
                alert("❌ Credenciales inválidas o error de login");
                return;
            }

            const result = await res.json();
            localStorage.removeItem("cartId");
            window.location.href = "/"; 
        } catch (err) {
            console.error("❌ Error en login con merge de carrito:", err);
            alert("❌ Error en login");
        }
    });
}


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

    const modalEl = document.getElementById("addProductModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    document.getElementById("productTitle").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productImage").value = "";
});

socket.on("productAdded", () => cargarProductos());

function asignarEventosBotones() {
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.onclick = (event) => {
            const productId = event.target.dataset.productId;
            let cartId = localStorage.getItem("cartId");

            if (!cartId) {
                fetch("/api/carts", { method: "POST" })
                    .then(res => res.json())
                    .then(data => {
                        cartId = data._id;
                        localStorage.setItem("cartId", cartId);
                        socket.emit("addToCart", { cartId, productId });
                    });
            } else {
                socket.emit("addToCart", { cartId, productId });
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

    document.querySelectorAll(".decrease-quantity").forEach(btn => {
        btn.onclick = (event) => {
            const cartId = localStorage.getItem("cartId");
            const productId = event.target.dataset.productId;

            if (cartId) {
                fetch(`/api/carts/${cartId}/product/${productId}/decrease`, {
                    method: "PUT"
                })
                .then(res => res.json())
                .then(updatedCart => actualizarCarrito(updatedCart))
                .catch(err => console.error("❌ Error al disminuir unidad del producto:", err));
            }
        };
    });
}

function guardarCarrito() {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return alert("❌ No hay un carrito activo para guardar.");

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
document.getElementById("clearCart")?.addEventListener("click", vaciarCarrito);

function vaciarCarrito() {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return alert("❌ No hay carrito activo para vaciar.");

    fetch(`/api/carts/${cartId}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
            alert("🗑️ Carrito vaciado.");
            actualizarCarrito({ products: [] });
        })
        .catch(error => {
            alert("❌ Error al vaciar el carrito.");
            console.error(error);
        });
}

function actualizarCarritoVacio() {
    document.getElementById("cartList").innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
    document.getElementById("cartItemCount").innerText = "0";
    document.getElementById("cartTotal").innerText = "";
}

function asignarEventosImagenes() {
    const productList = document.getElementById("productList");

    productList.addEventListener("click", (event) => {
        if (event.target.classList.contains("product-img")) {
            const imgEl = event.target;

            document.getElementById("productModalLabel").textContent = imgEl.dataset.name;
            document.getElementById("modalImage").src = imgEl.dataset.image;
            document.getElementById("modalImage").alt = imgEl.dataset.name;
            document.getElementById("modalDescription").textContent = imgEl.dataset.description;
            document.getElementById("modalPrice").textContent = imgEl.dataset.price;
            document.getElementById("modalStock").textContent = imgEl.dataset.stock;
        }
    });
}


socket.on("updateProducts", (products) => actualizarListaProductos(products));
function actualizarListaProductos(products) {
    const productList = document.getElementById("productList");
    const isAdmin = window.userRole === "admin";

    productList.innerHTML = products.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            width="80" 
            class="img-thumbnail product-img"
            style="cursor: pointer;"
            data-bs-toggle="modal"
            data-bs-target="#productModal"
            data-name="${product.name}"
            data-price="${product.price}"
            data-stock="${product.stock}"
            data-description="${product.description}"
            data-image="${product.image}"
          />
        </td>
        <td>$${product.price}</td>
        <td>${product.stock}</td>
        <td>
          <button class="btn btn-success add-to-cart" data-product-id="${product._id}">Agregar al Carrito</button>
          ${isAdmin ? `<button class="btn btn-danger delete-btn" data-product-id="${product._id}">Eliminar</button>` : ""}
        </td>
      </tr>
    `).join("");

    asignarEventosBotones();
    asignarEventosImagenes();
}

socket.on("updateCart", (cart) => actualizarCarrito(cart));

function actualizarCarrito(cart) {
    const cartList = document.getElementById("cartList");
    const cartItemCount = document.getElementById("cartItemCount");
    const cartTotal = document.getElementById("cartTotal");

    let total = 0;
    const totalItems = cart.products.reduce((acc, item) => {
        total += item.quantity * (item.productId?.price || 0);
        return acc + item.quantity;
    }, 0);

    if (cart.products.length === 0) {
        cartList.innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
        cartTotal.innerText = "";
    } else {
        cartList.innerHTML = cart.products.map(item => `
            <tr>
              <td>${item.productId?.name || "Producto desconocido"}</td>
              <td>${item.quantity}</td>
              <td class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-product-id="${item.productId._id}">-</button>
                <button class="btn btn-sm btn-outline-success add-to-cart" data-product-id="${item.productId._id}">+</button>
                <button class="btn btn-sm btn-danger remove-from-cart" data-product-id="${item.productId._id}">Eliminar</button>
              </td>
            </tr>
        `).join("");

        cartTotal.innerText = `Total: $${total.toFixed(2)}`;
    }

    if (cartItemCount) cartItemCount.innerText = totalItems.toString();
    asignarEventosBotones();
}

function recuperarCarrito() {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return;

    fetch(`/api/carts/${cartId}`)
        .then(res => res.json())
        .then(cart => actualizarCarrito(cart))
        .catch(() => localStorage.removeItem("cartId"));
}

// Finalizar compra con ticket modal
document.getElementById("finalizeCartBtn")?.addEventListener("click", async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return alert("❌ No hay carrito activo para finalizar.");

    try {
        const res = await fetch(`/api/purchase/${cartId}/purchase`, { method: "POST" });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                alert("⚠️ Necesitás iniciar sesión para finalizar la compra.");
                localStorage.setItem("pendingPurchase", "true"); // 🚀 Marca compra pendiente
                window.location.href = "/login";
                return;
            } else {
                throw new Error("Error procesando la compra.");
            }
        }

        const data = await res.json();
        if (data.error) {
            alert(`❌ Error al finalizar compra: ${data.error}`);
            return;
        }

        mostrarTicket(data.ticket); // 🚀 Nueva función para mostrar ticket
    } catch (err) {
        console.error("❌ Error procesando la compra:", err);
        alert("❌ Error procesando la compra.");
    }
});

//  mostrar Ticket
function mostrarTicket(ticket) {
    document.getElementById("ticketCode").innerText = ticket.code;
    document.getElementById("ticketEmail").innerText = ticket.purchaser;
    document.getElementById("ticketAmount").innerText = `$${ticket.amount}`;
    document.getElementById("ticketDate").innerText = new Date(ticket.purchase_datetime).toLocaleString();

    localStorage.removeItem("cartId");
    localStorage.removeItem("pendingPurchase");

    actualizarCarrito({ products: [] });
    cargarProductos();

    const ticketModal = new bootstrap.Modal(document.getElementById("ticketModal"));
    ticketModal.show();
}

//  chequearCompraPendiente

async function chequearCompraPendiente() {
    if (localStorage.getItem("pendingPurchase") === "true") {
        const cartId = localStorage.getItem("cartId");
        if (!cartId) {
            localStorage.removeItem("pendingPurchase");
            return;
        }

        // Paso 1: Verificar si el usuario está autenticado
        const currentRes = await fetch("/api/sessions/current");
        if (!currentRes.ok) {
            console.warn("⚠️ Usuario no autenticado, no se procesa compra pendiente.");
            return;
        }

        // Paso 2: Procesar la compra
        fetch(`/api/purchase/${cartId}/purchase`, { method: "POST" })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(`❌ Error al finalizar compra: ${data.error}`);
                } else {
                    alert("✅ Compra finalizada exitosamente después del login.");
                    mostrarTicket(data.ticket);
                }
            })
            .catch(err => {
                console.error("❌ Error procesando compra pendiente:", err);
                alert("❌ Error procesando compra pendiente.");
            });
    }
}



socket.on("stockUnavailable", ({ productName }) => {
    alert(`❌ ${productName} no tiene stock disponible.`);
});

asignarEventosBotones();
