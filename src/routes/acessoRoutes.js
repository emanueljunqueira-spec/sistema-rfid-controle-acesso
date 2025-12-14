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
 *     summary: Registra um acesso (entrada ou saída)
 *     description: |
 *       Registra a passagem de um participante pela catraca/portão usando o código RFID do cartão.
 *       O sistema determina automaticamente se é entrada ou saída com base no último registro.
 *       
 *       **Fluxo:**
 *       1. Se o cartão não existe → Acesso negado
 *       2. Se o cartão existe e último movimento foi "saída" → Registra "entrada"
 *       3. Se o cartão existe e último movimento foi "entrada" → Registra "saída"
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
 *         description: Acesso registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcesso'
 *       '400':
 *         description: Erro de validação ou cartão inativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcessoNegado'
 *       '401':
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Cartão não cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAcessoNegado'
 */
// Rota para registrar acesso
routes.post('/acesso', validate(AcessoValidator.store), AcessoController.store);

module.exports = routes;