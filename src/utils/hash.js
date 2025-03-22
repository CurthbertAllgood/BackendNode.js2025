// src/utils/hash.js
const bcrypt = require("bcryptjs");

const createHash = (password) => bcrypt.hashSync(password, 10);
const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

module.exports = { createHash, isValidPassword };
