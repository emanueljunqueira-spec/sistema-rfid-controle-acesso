// src/app/validators/AcessoValidator.js
const { z } = require('zod');

const store = z.object({
  codigo_rfid: z.string({
    required_error: 'O campo codigo_rfid é obrigatório.',
  }),
});

module.exports = {
  store,
};