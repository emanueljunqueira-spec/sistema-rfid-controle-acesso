require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('./app/models');

const usuarioRoutes = require('./routes/usuarioRoutes'); 
const participanteRoutes = require('./routes/participanteRoutes');
const cartaoRoutes = require('./routes/cartaoRoutes');
const acessoRoutes = require('./routes/acessoRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

// O require abaixo JÁ INICIA a conexão MQTT. Não precisa fazer mais nada.
require('./services/MQTTService'); 

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.database();
  }

  middlewares() {
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
    this.server.use(eventoRoutes);
    
    // APAGUEI A LINHA QUE DAVA ERRO AQUI!
  }

  async database() {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
      
      await sequelize.sync(); 
      console.log('✅ Tabelas sincronizadas com sucesso.');
    } catch (error) {
      console.error('❌ Não foi possível conectar ao banco de dados:', error);
    }
  }
}

module.exports = new App().server;