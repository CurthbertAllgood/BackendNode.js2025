// src/controllers/product.controller.js

const productRepository = require("../repositories/product.repository");

exports.getAllProducts = async (req, res) => {
  try {
    const { category, available, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.stock = available === "true" ? { $gt: 0 } : 0;

    const products = await productRepository.getFilteredProducts(filter, sort);
    res.status(200).json({ status: "success", payload: products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productRepository.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await productRepository.createProduct(req.body);
    res.status(201).json({ status: "success", product: newProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productRepository.updateProduct(req.params.pid, req.body);
    if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json({ status: "success", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await productRepository.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};