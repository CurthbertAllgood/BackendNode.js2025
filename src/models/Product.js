const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
    description: { type: String, trim: true, default: "Sin descripción" },
    image: { type: String, trim: true, default: "default.jpg" }
}, { timestamps: true }); 

// Agregar el plugin de paginación
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
