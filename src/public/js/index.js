const socket = io();

socket.on("updateProducts", (updatedProducts) => {
    updateProductList(updatedProducts);
});

// Evento para agregar producto
document.getElementById("productForm").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;

    if (productName.trim() !== "" && productPrice.trim() !== "") {
        socket.emit("addProduct", {
            id: uuid.v4(),
            name: productName,
            price: parseFloat(productPrice),
        });

        // Limpiar los campos después de agregar el producto
        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
    } else {
        alert("Por favor, ingrese un nombre y un precio para el producto.");
    }
});

// Evento para eliminar producto
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const productId = event.target.getAttribute("data-product-id");
        socket.emit("deleteProduct", productId);
    }
});

function updateProductList(products) {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach((product) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${product.id} - ${product.name} - $${product.price.toFixed(2)}`;

        // Agregar botón de eliminar con el id del producto
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Eliminar";
        deleteButton.setAttribute("data-product-id", product.id);

        listItem.appendChild(deleteButton);
        productList.appendChild(listItem);
    });
}
