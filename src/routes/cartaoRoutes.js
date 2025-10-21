// src/routes/cartaoRoutes.js
const { Router } = require('express');
const CartaoRFIDController = require('../app/controllers/CartaoRFIDController');
const authMiddleware = require('../app/middlewares/auth');
const validate = require('../app/middlewares/validate');
const CartaoValidator = require('../app/validators/CartaoValidator');

const routes = new Router();
routes.use(authMiddleware); // Todos os endpoints de cartão são protegidos

routes.post('/cartoes', validate(CartaoValidator.store), CartaoRFIDController.store);
routes.get('/cartoes', CartaoRFIDController.index);

module.exports = routes;