// src/routes/acessoRoutes.js
const { Router } = require('express');
const AcessoController = require('../app/controllers/AcessoController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const AcessoValidator = require('../app/validators/AcessoValidator');

const routes = new Router();
routes.use(authMiddleware);

/**
 * @swagger
 * /acesso:
 *   post:
 *     summary: Registra uma tentativa de acesso (entrada/saída) de um cartão RFID.
 *     description: Este é o endpoint principal que o dispositivo IoT (ESP32) deve chamar.
 *     tags: [Acesso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoAcesso'
 *     responses:
 *       '200':
 *         description: Acesso autorizado (entrada ou saída registrada).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcesso'
 *       '401':
 *         description: Não autorizado (token inválido).
 *       '403':
 *         description: Acesso negado (ex: cartão inativo ou não vinculado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcessoNegado'
 *       '404':
 *         description: Acesso negado (ex: cartão não cadastrado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcessoNegado'
 */
routes.post('/acesso', validate(AcessoValidator.store), AcessoController.store);

/**
 * @swagger
 * /acesso/logs:
 *   get:
 *     summary: Lista os últimos registros de acesso (entradas, saídas e negados).
 *     description: Endpoint para ser usado pelo dashboard de monitoramento.
 *     tags: [Acesso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista dos registros de acesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroAcesso'
 *       '401':
 *         description: Não autorizado (token inválido).
 */
routes.get('/acesso/logs', AcessoController.index);

module.exports = routes;