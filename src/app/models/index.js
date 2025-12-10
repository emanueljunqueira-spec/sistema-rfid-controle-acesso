// src/app/models/index.js
const sequelize = require('../../config/database');

const Usuario = require('./Usuario');
const Evento = require('./Evento');
const Participante = require('./Participante');
const CartaoRFID = require('./CartaoRFID');
const RegistroAcesso = require('./RegistroAcesso');

// Executa as associações de cada modelo
if (Usuario.associate) {
  Usuario.associate(sequelize.models);
}
if (Evento.associate) {
  Evento.associate(sequelize.models);
}
if (Participante.associate) {
  Participante.associate(sequelize.models);
}
if (CartaoRFID.associate) {
  CartaoRFID.associate(sequelize.models);
}
if (RegistroAcesso.associate) {
  RegistroAcesso.associate(sequelize.models);
}

module.exports = {
  sequelize,
  Usuario,
  Evento,
  Participante,
  CartaoRFID,
  RegistroAcesso,
};