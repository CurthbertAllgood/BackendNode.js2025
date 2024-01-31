const socket = io();
const tablecontainer = document.getElementById("table-body");
const countProducts = document.getElementById("count-products");
const formContainer = document.getElementById("form-post");

formContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
        code: e.target[0].value,
        thumbnail: e.target[1].value,
        title: e.target[2].value,
        price: parseInt(e.target[3].value),
        stock: parseInt(e.target[4].value),
        descripcion: e.target[5].value,
    };
    socket.emit("postProduct", data);
    formContainer.reset();
});

socket.on("recibirProductos", (data) => {
    countProducts.innerHTML = data.length;
    const listProdHTML = data
        .map((product, i) => {
            return `
            <tr>
            <td>
            <p>
            ${i + 1}
            </p>
            </td>
            <td>
            <p>
            ${product.code}
            </p>
            </td>
              <td>
                <img src=${product.thumbnail} alt=${
                product.title
            } style="height: 50px; width: 50px"/>
              </td>
              <td>
              <p class="title">
              ${product.title}
              </p>
              </td>
              <td>
              <p>
              ${product.price}    
              </p> 
              </td>
              <td>
              <p>
              ${product.stock}   
              </p>
                </td>
              <td>
              <p class="description">
              ${product.descripcion}       
              </p>
                </td>
            </tr>
    `;
        })
        .join("");
    tablecontainer.innerHTML = listProdHTML;
});

socket.on("todosConect", (data) => {
    console.log(data);
});