// src/routes/usuarioRoutes.js
const { Router } = require('express');
const UsuarioController = require('../app/controllers/UsuarioController');
const SessaoController = require('../app/controllers/SessaoController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const UsuarioValidator = require('../app/validators/UsuarioValidator');

const routes = new Router();

/**
 * @swagger
 * components:
 * schemas:
 * # ===============================================
 * # SCHEMAS DE AUTENTICAÇÃO
 * # ===============================================
 * Usuario:
 * type: object
 * properties:
 * id:
 * type: integer
 * description: ID auto-gerado do usuário.
 * nome:
 * type: string
 * description: Nome do usuário.
 * email:
 * type: string
 * format: email
 * description: Email de login do usuário.
 * cargo:
 * type: string
 * description: Função do usuário (ex: administrador).
 * example:
 * id: 1
 * nome: "Administrador"
 * email: "admin@evento.com"
 * cargo: "administrador"
 *
 * NovoUsuario:
 * type: object
 * required:
 * - nome
 * - email
 * - senha
 * - cargo
 * properties:
 * nome:
 * type: string
 * email:
 * type: string
 * format: email
 * senha:
 * type: string
 * format: password
 * minLength: 6
 * cargo:
 * type: string
 * example:
 * nome: "Luan Souza"
 * email: "luan@evento.com"
 * senha: "123456"
 * cargo: "operador"
 *
 * Login:
 * type: object
 * required:
 * - email
 * - senha
 * properties:
 * email:
 * type: string
 * format: email
 * senha:
 * type: string
 * format: password
 * example:
 * email: "admin@evento.com"
 * senha: "123456"
 *
 * Token:
 * type: object
 * properties:
 * usuario:
 * type: object
 * properties:
 * id:
 * type: integer
 * nome:
 * type: string
 * email:
 * type: string
 * token:
 * type: string
 * description: Token JWT para autenticação.
 *
 * # ===============================================
 * # SCHEMAS DE PARTICIPANTE
 * # ===============================================
 * Participante:
 * type: object
 * properties:
 * id:
 * type: integer
 * description: ID auto-gerado do participante.
 * nome:
 * type: string
 * description: Nome completo do participante.
 * email:
 * type: string
 * format: email
 * description: Email (opcional) do participante.
 * status:
 * type: boolean
 * description: Indica se o participante está ativo.
 * criado_em:
 * type: string
 * format: date-time
 * description: Data de criação do registro.
 * atualizado_em:
 * type: string
 * format: date-time
 * description: Data da última atualização.
 * example:
 * id: 1
 * nome: "Luan Souza"
 * email: "luan.souza@email.com"
 * status: true
 * criado_em: "2025-10-21T23:50:21.817Z"
 * atualizado_em: "2025-10-21T23:50:21.817Z"
 *
 * NovoParticipante:
 * type: object
 * required:
 * - nome
 * properties:
 * nome:
 * type: string
 * description: Nome completo do participante.
 * email:
 * type: string
 * format: email
 * description: Email (opcional) do participante.
 * status:
 * type: boolean
 * description: Status inicial (opcional, padrão true).
 * example:
 * nome: "Maria Silva"
 * email: "maria.silva@email.com"
 *
 * # ===============================================
 * # SCHEMAS DE CARTÃO RFID
 * # ===============================================
 * CartaoRFID:
 * type: object
 * properties:
 * id:
 * type: integer
 * codigo_rfid:
 * type: string
 * description: Código único lido do cartão.
 * participante_id:
 * type: integer
 * description: ID do participante vinculado.
 * ativo:
 * type: boolean
 * registrado_em:
 * type: string
 * format: date-time
 * atualizado_em:
 * type: string
 * format: date-time
 * example:
 * id: 1
 * codigo_rfid: "A1:B2:C3:D4"
 * participante_id: 1
 * ativo: true
 * registrado_em: "2025-10-21T23:55:00.000Z"
 * atualizado_em: "2025-10-21T23:55:00.000Z"
 *
 * NovoCartao:
 * type: object
 * required:
 * - codigo_rfid
 * - participante_id
 * properties:
 * codigo_rfid:
 * type: string
 * description: Código único lido do cartão.
 * participante_id:
 * type: integer
 * description: ID do participante ao qual o cartão será vinculado.
 * example:
 * codigo_rfid: "A1:B2:C3:D4"
 * participante_id: 1
 *
 * CartaoComParticipante:
 * type: object
 * properties:
 * id:
 * type: integer
 * codigo_rfid:
 * type: string
 * ativo:
 * type: boolean
 * participante:
 * $ref: '#/components/schemas/Participante'
 *
 * # ===============================================
 * # SCHEMAS DE ACESSO
 * # ===============================================
 * NovoAcesso:
 * type: object
 * required:
 * - codigo_rfid
 * properties:
 * codigo_rfid:
 * type: string
 * description: Código único lido do cartão.
 * example:
 * codigo_rfid: "A1:B2:C3:D4"
 *
 * RespostaAcesso:
 * type: object
 * properties:
 * status:
 * type: string
 * enum: [autorizado, negado]
 * tipo_movimento:
 * type: string
 * enum: [entrada, saida, negado]
 * participante:
 * type: string
 * description: Nome do participante (se autorizado).
 * mensagem:
 * type: string
 * example:
 * status: "autorizado"
 * tipo_movimento: "entrada"
 * participante: "Luan Souza"
 * mensagem: "Acesso entrada liberado."
 *
 * RespostaAcessoNegado:
 * type: object
 * properties:
 * status:
 * type: string
 * mensagem:
 * type: string
 * example:
 * status: "negado"
 * mensagem: "Cartão não cadastrado."
 *
 * RegistroAcesso:
 * type: object
 * properties:
 * id:
 * type: integer
 * cartao_id:
 * type: integer
 * tipo_movimento:
 * type: string
 * enum: [entrada, saida, negado]
 * mensagem:
 * type: string
 * hora_evento:
 * type: string
 * format: date-time
 * cartao:
 * type: object
 * properties:
 * codigo_rfid:
 * type: string
 * participante:
 * type: object
 * properties:
 * nome:
 * type: string
 */

// ===============================================
//  ROTAS DE AUTENTICAÇÃO
// ===============================================

/**
 * @swagger
 * /sessoes:
 * post:
 * summary: Autentica um usuário e retorna um token JWT.
 * tags: [Autenticação]
 * security: [] # Esta rota é PÚBLICA, remove a segurança padrão
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Login'
 * responses:
 * '200': # <--- CORRIGIDO
 * description: Login bem-sucedido, retorna o usuário e o token.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Token'
 * '400': # <--- CORRIGIDO
 * description: Erro de validação (ex: email inválido, senha faltando).
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (ex: usuário não encontrado, senha incorreta).
 */
routes.post(
  '/sessoes',
  validate(UsuarioValidator.sessao),
  SessaoController.store
);

/**
 * @swagger
 * /usuarios:
 * post:
 * summary: Cadastra um novo usuário no sistema.
 * tags: [Autenticação]
 * security: [] # Esta rota é PÚBLICA, remove a segurança padrão
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoUsuario'
 * responses:
 * '201': # <--- CORRIGIDO
 * description: Usuário criado com sucesso. Retorna os dados do usuário (sem a senha).
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Usuario'
 * '400': # <--- CORRIGIDO
 * description: Erro de validação (ex: email já em uso, senha curta).
 */
routes.post(
  '/usuarios',
  validate(UsuarioValidator.store),
  UsuarioController.store
);

// ===============================================
//  ROTAS PROTEGIDAS
// ===============================================
routes.use(authMiddleware);

/**
 * @swagger
 * /usuarios:
 * get:
 * summary: Lista todos os usuários cadastrados.
 * tags: [Autenticação]
 * security:
 * - bearerAuth: []
 * responses:
 * '200': # <--- CORRIGIDO
 * description: Lista de usuários.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Usuario'
 * '401': # <--- CORRIGIDO
 * description: Não autorizado (token inválido ou não fornecido).
 */
routes.get('/usuarios', UsuarioController.index);

module.exports = routes;