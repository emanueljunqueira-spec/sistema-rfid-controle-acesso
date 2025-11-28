const { Router } = require('express');
const AcessoController = require('../app/controllers/AcessoController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const AcessoValidator = require('../app/validators/AcessoValidator');

const routes = new Router();

routes.use(authMiddleware);

// Rota para registrar acesso (Documentação removida temporariamente para evitar erros de YAML)
routes.post('/acesso', validate(AcessoValidator.store), AcessoController.store);

module.exports = routes;