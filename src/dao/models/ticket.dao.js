// src/dao/models/ticket.dao.js
const Ticket = require("../../models/Ticket");

class TicketDAO {
  async create(data) {
    try {
      return await Ticket.create(data);
    } catch (error) {
      throw new Error("Error creando ticket: " + error.message);
    }
  }

  async findById(id) {
    try {
      return await Ticket.findById(id);
    } catch (error) {
      throw new Error("Error buscando ticket por ID: " + error.message);
    }
  }

  async findAll() {
    try {
      return await Ticket.find();
    } catch (error) {
      throw new Error("Error listando tickets: " + error.message);
    }
  }

  // Extra: Buscar por código si lo necesitás en el futuro
  async findByCode(code) {
    try {
      return await Ticket.findOne({ code });
    } catch (error) {
      throw new Error("Error buscando ticket por código: " + error.message);
    }
  }
}

module.exports = new TicketDAO();
