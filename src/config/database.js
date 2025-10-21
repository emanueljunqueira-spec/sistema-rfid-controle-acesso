// src/config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

module.exports = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '..', 'database', 'database.sqlite'), // Caminho do arquivo do banco
  logging: console.log, // Mostra os comandos SQL no console
});