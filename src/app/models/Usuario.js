// src/app/models/Usuario.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Importa a conexão

class Usuario extends Model {}

Usuario.init(
  {
    // Define os campos da tabela (colunas)
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false, // Não permite valor nulo
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // Garante que o email seja único no banco
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize, // Passa a instância da conexão
    modelName: 'Usuario', // Nome do modelo
    tableName: 'usuarios', // Nome da tabela no banco de dados
    timestamps: true, // Cria os campos `createdAt` e `updatedAt` automaticamente
    createdAt: 'criado_em', // Renomeia o campo `createdAt`
    updatedAt: false, // Desativa o campo `updatedAt` se não for necessário
  }
);

module.exports = Usuario;