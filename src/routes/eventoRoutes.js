const { Router } = require('express');
const EventoController = require('../app/controllers/EventoController');
const authMiddleware = require('../app/middlewares/auth');
const EventoValidator = require('../app/validators/EventoValidator');
const validate = require('../app/middlewares/validate');

const routes = new Router();

// Todas as rotas requerem Token
routes.use(authMiddleware);

/**
 * @swagger
 * /eventos:
 *   post:
 *     summary: Cria um novo evento
 *     description: Cadastra um novo evento no sistema com informações de data, local e descrição.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoEvento'
 *     responses:
 *       '201':
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
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
// Criar evento
routes.post('/eventos', validate(EventoValidator.store), EventoController.store);

/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Lista todos os eventos
 *     description: Retorna uma lista com todos os eventos cadastrados no sistema.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 *       '401':
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Listar eventos
routes.get('/eventos', EventoController.index);

/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     summary: Atualiza um evento
 *     description: Atualiza as informações de um evento existente pelo ID.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarEvento'
 *     responses:
 *       '200':
 *         description: Evento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
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
 *       '404':
 *         description: Evento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Atualizar evento
routes.put('/eventos/:id', validate(EventoValidator.update), EventoController.update);

/**
 * @swagger
 * /eventos/{id}:
 *   delete:
 *     summary: Exclui um evento
 *     description: Remove um evento do sistema pelo ID.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento a ser excluído
 *     responses:
 *       '200':
 *         description: Evento excluído com sucesso
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
 *         description: Evento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Deletar evento
routes.delete('/eventos/:id', EventoController.delete);

/**
 * @swagger
 * /eventos/{id}/participantes:
 *   get:
 *     summary: Lista participantes de um evento
 *     description: Retorna a lista de todos os participantes vinculados a um evento específico.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       '200':
 *         description: Lista de participantes do evento retornada com sucesso
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
 *       '404':
 *         description: Evento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Listar participantes de um evento específico
routes.get('/eventos/:id/participantes', EventoController.listarParticipantes);

module.exports = routes;