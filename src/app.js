// src/app.js
require('dotenv').config(); // <-- ADICIONE AQUI
const express = require('express');
const sequelize = require('./config/database');
require('./app/models');
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const participanteRoutes = require('./routes/participanteRoutes');
const cartaoRoutes = require('./routes/cartaoRoutes');
const acessoRoutes = require('./routes/acessoRoutes');



class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.database();
  }

  middlewares() {
    this.server.use(express.json());
  }

   routes() {
    // Vamos remover a rota de teste e adicionar a nossa rota principal
    this.server.use(usuarioRoutes); // <-- ADICIONE ESTA LINHA
    this.server.use(participanteRoutes);
    this.server.use(cartaoRoutes);
    this.server.use(acessoRoutes);
  }
  // src/app.js

// ... (resto da classe App)

      async database() {
        try {
          await sequelize.authenticate();
          console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
          
          await sequelize.sync(); // <-- ADICIONE ESTA LINHA
          console.log('✅ Tabelas sincronizadas com sucesso.');

        } catch (error) {
          console.error('❌ Não foi possível conectar/sincronizar o banco de dados:', error);
        }
      }

// ... (resto do código)
}

module.exports = new App().server;