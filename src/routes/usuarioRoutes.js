const { Router } = require('express');
const UsuarioController = require('../app/controllers/UsuarioController');
const SessaoController = require('../app/controllers/SessaoController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const UsuarioValidator = require('../app/validators/UsuarioValidator');

const routes = new Router();

// Rota Pública: Login
routes.post(
  '/sessoes',
  validate(UsuarioValidator.sessao),
  SessaoController.store
);

// Rota Pública: Cadastro de Usuário
routes.post(
  '/usuarios',
  validate(UsuarioValidator.store),
  UsuarioController.store
);

// --- Daqui para baixo, tudo requer Token ---
routes.use(authMiddleware);

// Listar Usuários
routes.get('/usuarios', UsuarioController.index);

// Excluir Usuário (A ROTA QUE ESTAVA FALTANDO)
routes.delete('/usuarios/:id', UsuarioController.delete);

module.exports = routes;