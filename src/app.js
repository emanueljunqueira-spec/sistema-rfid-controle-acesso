require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <--- 1. IMPORTAMOS O CORS AQUI
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
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
    // <--- 2. ATIVAMOS O CORS AQUI
    // Isso libera o acesso para qualquer frontend (ou você pode especificar a origem)
    this.server.use(cors()); 
    
    this.server.use(express.json());
  }

  routes() {
    this.server.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'API RFID - Documentação',
        customCss: '.swagger-ui .topbar { display: none }'
      })
    );
      
    this.server.use(usuarioRoutes);
    this.server.use(participanteRoutes);
    this.server.use(cartaoRoutes);
    this.server.use(acessoRoutes);
  }

  async database() {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
      
      // Sincroniza as tabelas (cria se não existirem)
      await sequelize.sync(); 
      console.log('✅ Tabelas sincronizadas com sucesso.');
    } catch (error) {
      console.error('❌ Não foi possível conectar ao banco de dados:', error);
    }
  }
}

// Exporta apenas a instância do servidor express
module.exports = new App().server;