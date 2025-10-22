// src/routes/cartaoRoutes.js
const { Router } = require('express');
const CartaoRFIDController = require('../app/controllers/CartaoRFIDController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const CartaoValidator = require('../app/validators/CartaoValidator');

const routes = new Router();
routes.use(authMiddleware); // Todos os endpoints de cartão são protegidos

/**
 * @swagger
 * /cartoes:
 * post:
 * summary: Cadastra um novo cartão RFID e o vincula a um participante.
 * tags: [Cartões]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoCartao'
 * responses:
 * '201': # <--- CORRIGIDO
 * description: Cartão cadastrado e vinculado com sucesso.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CartaoRFID'
 * '400': # <--- CORRIGIDO
 * description: Erro de validação ou cartão já existente.
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (token inválido).
 * '404': # <--- CORRIGIDO
 * description: Participante não encontrado.
 */
routes.post('/cartoes', validate(CartaoValidator.store), CartaoRFIDController.store);

/**
 * @swagger
 * /cartoes:
 * get:
 * summary: Lista todos os cartões RFID e seus participantes vinculados.
 * tags: [Cartões]
 * security:
 * - bearerAuth: []
 * responses:
 * '200': # <--- CORRIGIDO
 * description: Lista de cartões.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/CartaoComParticipante'
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (token inválido).
 */
routes.get('/cartoes', CartaoRFIDController.index);

module.exports = routes;