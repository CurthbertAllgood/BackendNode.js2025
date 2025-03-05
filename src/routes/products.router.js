const express = require("express");
const Product = require("../models/Product"); // Cargar modelo de MongoDB
const router = express.Router();

// 🔹 Obtener todos los productos con filtros, orden y paginación
router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, category, available, sort } = req.query;
    
    // Convertir valores
    page = parseInt(page);
    limit = parseInt(limit);
    let query = {};

    // 📌 Filtro por categoría
    if (category) query.category = category;

    // 📌 Filtro por disponibilidad (stock > 0 para disponibles, stock === 0 para no disponibles)
    if (available === "true") {
      query.stock = { $gt: 0 };  // Solo productos con stock disponible
    } else if (available === "false") {
      query.stock = 0;  // Solo productos sin stock
    }

    // 📌 Ordenamiento por precio (ascendente/descendente)
    let sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    // 📌 Aplicar paginación con filtros y orden
    const options = {
      page,
      limit,
      sort: sortOption,
      lean: true, // Convertir documentos de Mongoose a objetos JS simples
    };

    const products = await Product.paginate(query, options);

    // 📌 Respuesta con formato requerido
    res.json({
      status: "success",
      payload: products.docs, 
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}` : null
    });

  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Obtener un producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    console.error("❌ Error obteniendo producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Agregar un nuevo producto
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error agregando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Actualizar un producto
router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Eliminar un producto
router.delete("/:pid", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.pid);
    res.json({ message: "✅ Producto eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
