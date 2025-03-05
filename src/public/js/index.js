const socket = io();

// 🔹 Agregar producto
document.getElementById("addProductBtn").addEventListener("click", () => {
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
  console.log("📤 Enviando producto:", newProduct);
  socket.emit("addProduct", newProduct);
});

// 🔹 Escuchar confirmación desde el backend
socket.on("productAdded", (product) => {
  alert("✅ Producto agregado correctamente: " + product.name);
  location.reload();
});

// 🔹 Escuchar errores
socket.on("addProductError", (message) => {
  alert("❌ Error agregando producto: " + message);
});

// 🔹 Aplicar filtros
document.getElementById("applyFilters").addEventListener("click", () => {
  const category = document.getElementById("categoryFilter").value;
  const availability = document.getElementById("availabilityFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let query = "?";
  if (category) query += `category=${category}&`;
  if (availability !== "") query += `available=${availability}&`;
  if (sort) query += `sort=${sort}&`;

  console.log("🔍 Enviando request:", `/api/products${query}`);

  fetch(`/api/products${query}`)
      .then(res => res.json())
      .then(data => {
          const productList = document.getElementById("productList");
          productList.innerHTML = data.payload.map(product => `
              <tr>
                  <td>${product.name}</td>
                  <td>${product.price}</td>
                  <td>${product.stock}</td>
                  <td>
                      <button class="btn btn-success add-to-cart" data-product-id="${product._id}" 
                          ${product.stock === 0 ? "disabled" : ""}>
                          Agregar al Carrito
                      </button>
                      <button class="btn btn-danger delete-btn" data-product-id="${product._id}">Eliminar</button>
                  </td>
              </tr>
          `).join("");
      });
});

// 🔹 Manejo de eventos en botones dinámicos
document.addEventListener("click", (event) => {
  const cartId = localStorage.getItem("cartId");
  
  if (event.target.classList.contains("add-to-cart")) {
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
  }
  
  if (event.target.classList.contains("delete-btn")) {
    const productId = event.target.dataset.productId;
    socket.emit("deleteProduct", productId);
  }

  if (event.target.classList.contains("remove-from-cart")) {
    const productId = event.target.dataset.productId;
    if (cartId) {
      socket.emit("removeFromCart", { cartId, productId });
    }
  }
});

// 🔹 Actualizar lista de productos en tiempo real
socket.on("updateProducts", (products) => {
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
});

// 🔹 Manejo de carritos
socket.on("cartCreated", ({ cartId }) => {
  localStorage.setItem("cartId", cartId);
});

socket.on("updateCart", (cart) => {
  const cartList = document.getElementById("cartList");

  if (cart.products.length === 0) {
    cartList.innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
    localStorage.removeItem("cartId"); // Eliminar el carrito de localStorage
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
});

// 🔹 Vaciar carrito
document.getElementById("clearCart").addEventListener("click", () => {
  const cartId = localStorage.getItem("cartId");
  if (cartId) {
    socket.emit("clearCart", cartId);
  }
});

// 🔹 Confirmación de vaciado del carrito
socket.on("cartCleared", () => {
  localStorage.removeItem("cartId");
  document.getElementById("cartList").innerHTML = "<tr><td colspan='3'>El carrito está vacío</td></tr>";
  alert("✅ Carrito vaciado con éxito.");
});

// 🔹 Mostrar alerta emergente si no hay stock disponible
socket.on("stockUnavailable", ({ productName }) => {
  alert(`❌ ${productName} no tiene stock disponible.`);
});