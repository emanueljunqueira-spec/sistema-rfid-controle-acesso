const { Router } = require('express');
const ParticipanteController = require('../app/controllers/ParticipanteController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const ParticipanteValidator = require('../app/validators/ParticipanteValidator');

const routes = new Router();

// Todas as rotas requerem Token
routes.use(authMiddleware);

/**
 * @swagger
 * /participantes:
 *   post:
 *     summary: Cadastra um novo participante
 *     description: Cria um novo participante no sistema. O participante pode ser vinculado a um cartão RFID posteriormente.
 *     tags: [Participantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoParticipante'
 *     responses:
 *       '201':
 *         description: Participante criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participante'
 *       '400':
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Cadastrar Participante
routes.post(
  '/participantes',
  validate(ParticipanteValidator.store),
  ParticipanteController.store
);

/**
 * @swagger
 * /participantes:
 *   get:
 *     summary: Lista todos os participantes
 *     description: Retorna uma lista com todos os participantes cadastrados no sistema.
 *     tags: [Participantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de participantes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Participante'
 *       '401':
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Listar Participantes
routes.get('/participantes', ParticipanteController.index);

/**
 * @swagger
 * /participantes/{id}:
 *   delete:
 *     summary: Exclui um participante
 *     description: Remove um participante do sistema pelo ID. Isso também desvincula qualquer cartão RFID associado.
 *     tags: [Participantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante a ser excluído
 *     responses:
 *       '200':
 *         description: Participante excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Participante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Excluir Participante (A ROTA QUE ESTAVA FALTANDO)
routes.delete('/participantes/:id', ParticipanteController.delete);

module.exports = routes;