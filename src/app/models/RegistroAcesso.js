// src/app/models/RegistroAcesso.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class RegistroAcesso extends Model {
  static associate(models) {
    // Um Registro de Acesso pertence a um CartaoRFID
    this.belongsTo(models.CartaoRFID, {
      foreignKey: 'cartao_id',
      as: 'cartao',
    });
  }
}

RegistroAcesso.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cartao_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'cartoes_rfid',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se o cartão for deletado, mantemos o registro de acesso
    },
    tipo_movimento: {
      type: DataTypes.ENUM('entrada', 'saida', 'negado'), // Define os valores permitidos
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RegistroAcesso',
    tableName: 'registros_acesso',
    createdAt: 'hora_evento', // Renomeia o campo createdAt
    updatedAt: false, // Não precisamos do campo updatedAt aqui
  }
);

module.exports = RegistroAcesso;