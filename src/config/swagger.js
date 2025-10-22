// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Caminho CORRETO para encontrar todos os arquivos de rotas
const routesPath = path.resolve(__dirname, '..', 'routes', '*.js');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Controle de Acesso RFID',
      version: '1.0.0',
      description: 'API RESTful para gerenciamento de participantes e controle de acesso com IoT e RFID.',
      contact: {
        name: 'Luan (Desenvolvedor)',
        email: 'luan@evento.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    // Lista completa de todas as nossas tags (categorias)
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de cadastro e login de usuários.'
      },
      {
        name: 'Participantes',
        description: 'Gerenciamento de participantes do evento.'
      },
      {
        name: 'Cartões',
        description: 'Gerenciamento e vínculo de cartões RFID.'
      },
      {
        name: 'Acesso',
        description: 'Endpoints para registro e log de acessos (Entrada/Saída).'
      }
    ],
    // Definição do nosso esquema de segurança JWT
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer {token}',
        },
      },
    },
    // Aplica a segurança JWT a todas as rotas por padrão
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Diz ao Swagger para ler todos os arquivos .js dentro da pasta de rotas
  apis: [routesPath],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;