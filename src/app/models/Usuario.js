const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcryptjs'); // Certifique-se de ter instalado: npm install bcryptjs

class Usuario extends Model {}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Campo virtual: existe no código, mas não no banco
    senha: {
      type: DataTypes.VIRTUAL, 
      allowNull: true, 
    },
    cargo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['administrador', 'gerente', 'operador']], // Validação extra do Sequelize
      }
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false,
  }
);

// HOOK DE SEGURANÇA (O Segredo)
// Antes de salvar qualquer usuário, se a senha foi informada, criptografa ela.
Usuario.addHook('beforeSave', async (usuario) => {
  if (usuario.senha) {
    usuario.senha_hash = await bcrypt.hash(usuario.senha, 8);
  }
});

module.exports = Usuario;