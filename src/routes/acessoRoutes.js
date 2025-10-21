// src/routes/acessoRoutes.js
const { Router } = require('express');
const AcessoController = require('../app/controllers/AcessoController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const AcessoValidator = require('../app/validators/AcessoValidator');

const routes = new Router();
routes.use(authMiddleware);

// A rota que o ESP32 vai chamar
routes.post('/acesso', validate(AcessoValidator.store), AcessoController.store);

// A rota para o dashboard ver os logs
routes.get('/acesso/logs', AcessoController.index);

module.exports = routes;