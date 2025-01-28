const socket = io();

// Agregar producto
document.getElementById("addProductBtn").addEventListener("click", () => {
  const title = document.getElementById("productTitle").value;
  const description = document.getElementById("productDescription").value;
  const code = document.getElementById("productCode").value;
  const price = document.getElementById("productPrice").value;
  const stock = document.getElementById("productStock").value;
  const category = document.getElementById("productCategory").value;
  const thumbnails = document.getElementById("productThumbnails").value.split(",");

  if (!title || !description || !code || !price || !stock || !category) {
    alert("Todos los campos son obligatorios, excepto las imágenes.");
    return;
  }

  const newProduct = {
    title,
    description,
    code,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    thumbnails,
  };

  socket.emit("addProduct", newProduct);
  document.getElementById("statusMessage").textContent = "Producto agregado con éxito.";
  setTimeout(() => {
    document.getElementById("statusMessage").textContent = "";
  }, 3000);

  document.getElementById("productForm").reset();
});

// Actualizar lista de productos en tiempo real
socket.on("updateProducts", (products) => {
  const productList = document.getElementById("productList");
  productList.innerHTML = products.map(
    (product) =>
      `<li>${product.title} - $${product.price} - Stock: ${product.stock}
      <button class="delete-btn" data-product-id="${product.id}">Eliminar</button></li>`
  ).join("");

  // Agregar eventos de eliminación
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      socket.emit("deleteProduct", btn.dataset.productId);
    });
  });
});

// Mensaje de eliminación
socket.on("productDeleted", () => {
  document.getElementById("statusMessage").textContent = "Producto eliminado con éxito.";
  setTimeout(() => {
    document.getElementById("statusMessage").textContent = "";
  }, 3000);
});
