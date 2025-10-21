// src/app/validators/ParticipanteValidator.js
const { z } = require('zod');

const store = z.object({
  nome: z.string({
    required_error: 'O campo nome é obrigatório.',
  }).min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),

  email: z.string()
    .email({ message: 'Formato de e-mail inválido.' })
    .optional(), // Torna o campo de e-mail opcional

  status: z.boolean({
    invalid_type_error: 'O status deve ser um valor booleano (true ou false).',
  }).optional(), // Torna o campo de status opcional
});

module.exports = {
  store,
};