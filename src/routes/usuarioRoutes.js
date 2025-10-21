// src/routes/usuarioRoutes.js
const { Router } = require('express');
const UsuarioController = require('../app/controllers/UsuarioController');
const SessaoController = require('../app/controllers/SessaoController');
const authMiddleware = require('../app/middlewares/auth');
// Nossas novas importações
const validate = require('../app/middlewares/validate');
const UsuarioValidator = require('../app/validators/UsuarioValidator');

const routes = new Router();

// ===============================================
//  1. ROTAS PÚBLICAS (NÃO precisam de token)
//  Qualquer pessoa pode acessar estas rotas.
// ===============================================
routes.post(
  '/sessoes',
  validate(UsuarioValidator.sessao), // Validação ANTES do controller
  SessaoController.store
);
routes.post(
  '/usuarios',
  validate(UsuarioValidator.store), // Validação ANTES do controller
  UsuarioController.store
);
// ===============================================
//  2. O MIDDLEWARE DE AUTENTICAÇÃO (O "PORTEIRO")
//  Tudo que for definido ABAIXO desta linha
//  exigirá um token JWT válido.
// ===============================================
routes.use(authMiddleware);

// ===============================================
//  3. ROTAS PROTEGIDAS (PRECISAM de token)
//  Apenas usuários logados podem acessar.
// ===============================================
routes.get('/usuarios', UsuarioController.index);     // Para listar os usuários existentes

module.exports = routes;