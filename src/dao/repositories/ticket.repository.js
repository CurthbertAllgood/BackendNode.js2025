// src/dao/repositories/ticket.repository.js
const Ticket = require("../../models/Ticket");

class TicketRepository {
  async createTicket({ amount, purchaser }) {
    try {
      return await Ticket.create({ amount, purchaser });
    } catch (error) {
      throw new Error("Error creando ticket: " + error.message);
    }
  }

  async getTicketById(id) {
    try {
      return await Ticket.findById(id);
    } catch (error) {
      throw new Error("Error obteniendo ticket por ID: " + error.message);
    }
  }

  async getAllTickets() {
    try {
      return await Ticket.find();
    } catch (error) {
      throw new Error("Error listando tickets: " + error.message);
    }
  }

  async getTicketByCode(code) {
    try {
      return await Ticket.findOne({ code });
    } catch (error) {
      throw new Error("Error obteniendo ticket por código: " + error.message);
    }
  }
}

module.exports = new TicketRepository();
