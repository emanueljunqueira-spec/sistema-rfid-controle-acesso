// src/app/controllers/UsuarioController.js
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

class UsuarioController {
  async index(req, res) {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'cargo'],
    });
    return res.json(usuarios);
  }

  async store(req, res) {
    try {
      const { nome, email, senha, cargo } = req.body;
      if (!senha) return res.status(400).json({ error: 'Senha obrigatória.' });

      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ error: 'E-mail já em uso.' });

      const senha_hash = await bcrypt.hash(senha, 8);
      const novoUsuario = await Usuario.create({ nome, email, senha_hash, cargo });

      return res.status(201).json({ id: novoUsuario.id, nome, email, cargo });
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao criar usuário.' });
    }
  }

  // NOVO MÉTODO: EXCLUIR
  async delete(req, res) {
    try {
      const { id } = req.params;
      // AGORA: Recebemos email e senha para re-autenticação total
      const { emailConfirmacao, senhaConfirmacao } = req.body; 

      // 1. Busca o admin que está logado (pelo ID do token)
      const adminLogado = await Usuario.findByPk(req.usuarioId);
      
      if (!adminLogado) return res.status(401).json({ error: 'Usuário não autenticado.' });

      if (adminLogado.cargo !== 'administrador') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir.' });
      }

      // 2. NOVA CAMADA: Verifica se o E-mail de confirmação bate com o do admin logado
      if (emailConfirmacao !== adminLogado.email) {
        return res.status(401).json({ error: 'O e-mail de confirmação não confere com o usuário logado.' });
      }

      // 3. Verifica a senha
      if (!senhaConfirmacao) return res.status(400).json({ error: 'Senha de confirmação necessária.' });
      
      const senhaValida = await bcrypt.compare(senhaConfirmacao, adminLogado.senha_hash);
      if (!senhaValida) return res.status(401).json({ error: 'Senha de confirmação incorreta.' });

      // 4. Lógica de exclusão do alvo
      const alvo = await Usuario.findByPk(id);
      if (!alvo) return res.status(404).json({ error: 'Usuário alvo não encontrado.' });

      if (alvo.cargo === 'administrador') {
        return res.status(403).json({ error: 'Não é permitido excluir outro administrador.' });
      }

      await alvo.destroy();
      return res.json({ message: 'Usuário excluído com sucesso.' });

    } catch (err) {
      return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
    }
  }
}

module.exports = new UsuarioController();