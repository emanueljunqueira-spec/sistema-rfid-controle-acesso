const { Router } = require('express');
const EventoController = require('../app/controllers/EventoController');
const authMiddleware = require('../app/middlewares/auth');
const EventoValidator = require('../app/validators/EventoValidator');

const routes = new Router();

// Todas as rotas requerem Token
routes.use(authMiddleware);

// Criar evento
routes.post('/eventos', EventoValidator.store, EventoController.store);

// Listar eventos
routes.get('/eventos', EventoController.index);

// Atualizar evento
routes.put('/eventos/:id', EventoValidator.update, EventoController.update);

// Deletar evento
routes.delete('/eventos/:id', EventoController.delete);

module.exports = routes;