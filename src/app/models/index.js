// src/app/models/index.js
const sequelize = require('../../config/database');

const Usuario = require('./Usuario');
const Participante = require('./Participante');
const CartaoRFID = require('./CartaoRFID');
const RegistroAcesso = require('./RegistroAcesso'); // <-- ADICIONE ESTA LINHA

// ... (resto do código de associação)

// Apenas certifique-se de que o if para RegistroAcesso seja adicionado:
if (Usuario.associate) {
  Usuario.associate(sequelize.models);
}
if (Participante.associate) {
  Participante.associate(sequelize.models);
}
if (CartaoRFID.associate) {
  CartaoRFID.associate(sequelize.models);
}
if (RegistroAcesso.associate) { // <-- ADICIONE ESTE BLOCO
  RegistroAcesso.associate(sequelize.models);
}