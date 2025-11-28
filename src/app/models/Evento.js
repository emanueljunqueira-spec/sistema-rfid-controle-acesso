const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class Evento extends Model {
  static associate(models) {
    // Um Evento possui muitos Participantes
    this.hasMany(models.Participante, {
      foreignKey: 'evento_id',
      as: 'participantes'
    });
  }
}

Evento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    data_evento: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    local: {
      type: DataTypes.STRING(150),
      allowNull: false, // Corrigido: era true, mas validador exige
    },

    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'cancelado', 'finalizado'), // Corrigido: era BOOLEAN
      defaultValue: 'ativo',
    },
  },
  {
    sequelize,
    modelName: 'Evento',
    tableName: 'eventos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

module.exports = Evento;