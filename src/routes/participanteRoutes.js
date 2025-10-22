// src/routes/participanteRoutes.js
const { Router } = require('express');
const ParticipanteController = require('../app/controllers/ParticipanteController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const ParticipanteValidator = require('../app/validators/ParticipanteValidator');

const routes = new Router();

// Todas as rotas de participante exigem autenticação
routes.use(authMiddleware);

/**
 * @swagger
 * /participantes:
 * post:
 * summary: Cadastra um novo participante.
 * tags: [Participantes]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoParticipante'
 * responses:
 * '201': # <--- CORRIGIDO
 * description: Participante criado com sucesso.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Participante'
 * '400': # <--- CORRIGIDO
 * description: Erro de validação (ex: nome faltando, email inválido).
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (token inválido ou não fornecido).
 */
routes.post(
  '/participantes',
  validate(ParticipanteValidator.store),
  ParticipanteController.store
);

/**
 * @swagger
 * /participantes:
 * get:
 * summary: Lista todos os participantes.
 * tags: [Participantes]
 * security:
 * - bearerAuth: []
 * responses:
 * '200': # <--- CORRIGIDO
 * description: Lista de participantes.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Participante'
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (token inválido ou não fornecido).
 */
routes.get('/participantes', ParticipanteController.index);

module.exports = routes;