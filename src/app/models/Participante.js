// src/app/models/Participante.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class Participante extends Model {
  // Adicione este método
  static associate(models) {
    // Um Participante pertence a um Evento
    this.belongsTo(models.Evento, {
      foreignKey: 'evento_id',
      as: 'evento',
    });
    // Um Participante pode ter muitos CartoesRFID
    this.hasMany(models.CartaoRFID, {
      foreignKey: 'participante_id',
      as: 'cartoes',
    });
  }
}


Participante.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'eventos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true, // Opcional, como definido no modelo
      unique: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Por padrão, um novo participante está ativo
    },
  },
  {
    sequelize,
    modelName: 'Participante',
    tableName: 'participantes',
    timestamps: true, // Habilita criado_em e atualizado_em
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

module.exports = Participante;