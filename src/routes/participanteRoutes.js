// src/routes/participanteRoutes.js
const { Router } = require('express');
const ParticipanteController = require('../app/controllers/ParticipanteController');
const authMiddleware = require('../app/middlewares/auth');

// Nossas novas importações
const validate = require('../app/middlewares/validate');
const ParticipanteValidator = require('../app/validators/ParticipanteValidator');

const routes = new Router();

// Todas as rotas de participante exigem autenticação
routes.use(authMiddleware);

routes.post(
  '/participantes',
  validate(ParticipanteValidator.store), // <-- VALIDAÇÃO APLICADA AQUI
  ParticipanteController.store
);

routes.get('/participantes', ParticipanteController.index);

module.exports = routes;