// File: src/models/Ticket.js

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    default: uuidv4, // forma directa
    required: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  purchaser: {
    type: String,
    required: true,
    match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email inválido"]
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
