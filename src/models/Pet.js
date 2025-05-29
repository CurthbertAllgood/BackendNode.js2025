// src/models/Pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    default: 'Desconocida'
  },
  age: {
    type: Number,
    min: 0
  },
  adopted: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
