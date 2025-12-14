const Usuario = require('../models/Usuario');
const sequelize = require('../../config/database');
// Importa as funções de permissão (RBAC)
const { podeCriarUsuario, podeDeletarUsuario } = require('../utils/rbac');
// Nota: O bcrypt é usado aqui APENAS para validar a senha do admin na exclusão,
// não para criar o usuário (o Model faz isso).
const bcrypt = require('bcryptjs'); 

class UsuarioController {
  
  // Listar Usuários
  async index(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome', 'email', 'cargo'], // Não retorna a senha
        order: [['nome', 'ASC']]
      });
      return res.json(usuarios);
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      return res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  }

  // Criar Usuário
  async store(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { nome, email, senha, cargo } = req.body;
      
      // 1. Quem está tentando criar?
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });
      
      // 2. Validação RBAC: Esse usuário tem poder para criar o cargo solicitado?
      if (!podeCriarUsuario(usuarioLogado.cargo, cargo)) {
        await transaction.rollback();
        return res.status(403).json({ 
          error: `Seu cargo (${usuarioLogado.cargo}) não permite criar usuários do tipo '${cargo}'.` 
        });
      }

      // 3. Verifica duplicidade
      const existe = await Usuario.findOne({ where: { email }, transaction });
      if (existe) {
        await transaction.rollback();
        return res.status(400).json({ error: 'E-mail já em uso.' });
      }

      // 4. Criação
      // ATENÇÃO: Passamos 'senha' pura. O Hook do Model vai criptografar.
      const novoUsuario = await Usuario.create(
        { nome, email, senha, cargo }, 
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo
      });

    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(400).json({ error: 'Erro ao criar usuário.' });
    }
  }

  // Deletar Usuário (Zona de Perigo)
  async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { emailConfirmacao, senhaConfirmacao } = req.body;

      // 1. Busca admin logado para re-autenticação
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });

      // 2. Valida credenciais do Admin (Segurança extra)
      if (usuarioLogado.email !== emailConfirmacao) {
        await transaction.rollback();
        return res.status(401).json({ error: 'E-mail de confirmação incorreto.' });
      }

      const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioLogado.senha_hash);
      if (!senhaValida) {
        await transaction.rollback();
        return res.status(401).json({ error: 'Senha de confirmação incorreta.' });
      }

      // 3. Busca o alvo
      const alvo = await Usuario.findByPk(id, { transaction });
      if (!alvo) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // 4. Validação RBAC: Posso deletar esse cargo?
      if (!podeDeletarUsuario(usuarioLogado.cargo, alvo.cargo)) {
        await transaction.rollback();
        return res.status(403).json({ 
          error: `Seu cargo não permite excluir usuários do tipo '${alvo.cargo}'.` 
        });
      }

      // 5. Proteção contra suicídio digital (Não deletar a si mesmo)
      if (usuarioLogado.id === alvo.id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
      }

      await alvo.destroy({ transaction });
      await transaction.commit();

      return res.json({ message: 'Usuário excluído com sucesso.' });

    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
    }
  }
}

module.exports = new UsuarioController();