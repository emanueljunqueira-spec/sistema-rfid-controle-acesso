// src/app/controllers/SessaoController.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const authConfig = require('../../config/auth');
const bcrypt = require('bcryptjs');

class SessaoController {
  async store(req, res) {
    const { email, senha } = req.body;

    // 1. Verifica se o usuário existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, nome } = usuario;

    // 3. Se tudo estiver certo, gera o token
    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    // Retorna os dados do usuário e o token
    return res.json({
      usuario: {
        id,
        nome,
        email,
      },
      token,
    });
  }
}

module.exports = new SessaoController();