// src/app/models/CartaoRFID.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class CartaoRFID extends Model {
  // Método para definir as associações
  static associate(models) {
    // Um CartaoRFID pertence a um Participante
    this.belongsTo(models.Participante, {
      foreignKey: 'participante_id',
      as: 'participante',
    });
    // ADICIONE ESTA NOVA RELAÇÃO
    // Um CartaoRFID pode ter muitos Registros de Acesso
    this.hasMany(models.RegistroAcesso, {
      foreignKey: 'cartao_id',
      as: 'registros',
    });
  }
}

CartaoRFID.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_rfid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // Cada cartão deve ter um código único
    },
    participante_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'participantes', // Nome da tabela
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se o participante for deletado, o cartão fica sem dono
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CartaoRFID',
    tableName: 'cartoes_rfid',
    createdAt: 'registrado_em',
    updatedAt: 'atualizado_em',
  }
);

module.exports = CartaoRFID;