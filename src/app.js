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

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.database();
  }

  middlewares() {
    // Permite que o frontend (porta 3000) converse com o backend (porta 3333)
    this.server.use(cors({ origin: '*' })); 
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
  }

  async database() {
    try {
      await sequelize.authenticate();
      console.log('✅ Banco de dados conectado com sucesso.');
      await sequelize.sync();
      console.log('✅ Modelos sincronizados.');
    } catch (err) {
      console.error('❌ Erro ao conectar ao banco:', err);
    }
  }

  listen(PORT) {
    return this.server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  }
}

module.exports = new App();
