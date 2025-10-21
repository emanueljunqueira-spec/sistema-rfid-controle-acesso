// src/app/validators/UsuarioValidator.js
const { z } = require('zod');

// Regras para criar um novo usuário
const store = z.object({
  nome: z.string({
    // Mensagem para quando o campo está faltando
    required_error: 'O campo nome é obrigatório.',
    // Mensagem para quando o tipo está errado (ex: enviaram um número)
    invalid_type_error: 'O nome deve ser um texto.',
  }).min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),

  email: z.string({
    required_error: 'O campo email é obrigatório.',
  }).email({ message: 'Formato de e-mail inválido.' }),

  senha: z.string({
    required_error: 'O campo senha é obrigatório.',
  }).min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),

  cargo: z.string({
    required_error: 'O campo cargo é obrigatório.',
  }).min(1, { message: 'O campo cargo não pode ser vazio.' }),
});

// Regras para fazer login
const sessao = z.object({
  email: z.string({
    required_error: 'O campo email é obrigatório.',
  }).email('Formato de e-mail inválido.'),

  senha: z.string({
    required_error: 'O campo senha é obrigatório.',
  }).min(1, 'A senha é obrigatória.'),
});

module.exports = {
  store,
  sessao,
};