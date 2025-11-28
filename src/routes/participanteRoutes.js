const { Router } = require('express');
const ParticipanteController = require('../app/controllers/ParticipanteController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const ParticipanteValidator = require('../app/validators/ParticipanteValidator');

const routes = new Router();

// Todas as rotas requerem Token
routes.use(authMiddleware);

// Cadastrar Participante
routes.post(
  '/participantes',
  validate(ParticipanteValidator.store),
  ParticipanteController.store
);

// Listar Participantes
routes.get('/participantes', ParticipanteController.index);

// Excluir Participante (A ROTA QUE ESTAVA FALTANDO)
routes.delete('/participantes/:id', ParticipanteController.delete);

module.exports = routes;