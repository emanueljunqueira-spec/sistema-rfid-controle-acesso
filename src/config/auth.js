// src/config/auth.js
require('dotenv').config();

module.exports = {
  secret: process.env.APP_SECRET,
  expiresIn: '7d', // Por quanto tempo o token será válido (7 dias)
};