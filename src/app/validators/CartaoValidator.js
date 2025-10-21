// src/app/validators/CartaoValidator.js
const { z } = require('zod');

const store = z.object({
  codigo_rfid: z.string({
    required_error: 'O campo codigo_rfid é obrigatório.',
  }).min(1, 'O codigo_rfid não pode ser vazio.'),

  participante_id: z.number({
    required_error: 'O campo participante_id é obrigatório.',
    invalid_type_error: 'O participante_id deve ser um número.',
  }),
});

module.exports = {
  store,
};