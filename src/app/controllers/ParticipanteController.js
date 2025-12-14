const Participante = require('../models/Participante');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');
// Importamos a regra correta do RBAC
const { podeGerenciarParticipantes } = require('../utils/rbac');

class ParticipanteController {
  
  async index(req, res) {
    try {
      const participantes = await Participante.findAll({ order: [['nome', 'ASC']] });
      return res.json(participantes);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar participantes.' });
    }
  }

  async store(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { nome, email, status, evento_id } = req.body;
      
      // 1. Verifica permissão
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });
      if (!podeGerenciarParticipantes(usuarioLogado.cargo)) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Sem permissão para criar participantes.' });
      }

      if (email) {
        const existe = await Participante.findOne({ where: { email }, transaction });
        if (existe) {
          await transaction.rollback();
          return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }
      }

      const novo = await Participante.create(
        { nome, email, status, evento_id },
        { transaction }
      );
      
      await transaction.commit();
      return res.status(201).json(novo);

    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Erro ao criar participante.' });
    }
  }

  async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { emailConfirmacao, senhaConfirmacao } = req.body;

      // 1. Busca usuário logado
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });

      // 2. Verifica permissão RBAC
      if (!podeGerenciarParticipantes(usuarioLogado.cargo)) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Sem permissão para excluir participantes.' });
      }

      // 3. Re-autenticação (Sudo Mode)
      if (emailConfirmacao !== usuarioLogado.email) {
        await transaction.rollback();
        return res.status(401).json({ error: 'E-mail de confirmação incorreto.' });
      }

      const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioLogado.senha_hash);
      if (!senhaValida) {
        await transaction.rollback();
        return res.status(401).json({ error: 'Senha de confirmação incorreta.' });
      }

      // 4. Executa exclusão
      const alvo = await Participante.findByPk(id, { transaction });
      if (!alvo) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Participante não encontrado.' });
      }

      await alvo.destroy({ transaction });
      await transaction.commit();

      return res.json({ message: 'Participante excluído com sucesso.' });

    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Erro ao excluir participante.' });
    }
  }
}

module.exports = new ParticipanteController();