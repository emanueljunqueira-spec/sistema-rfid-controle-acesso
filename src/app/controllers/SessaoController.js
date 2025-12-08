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

    // AQUI ESTAVA O ERRO: Faltava extrair o 'cargo'
    const { id, nome, cargo } = usuario;

    // 3. Gera o token
    const token = jwt.sign({ id, cargo }, authConfig.secret, { // Dica: coloquei o cargo dentro do token também
      expiresIn: authConfig.expiresIn,
    });

    // Retorna os dados completos
    return res.json({
      usuario: {
        id,
        nome,
        email,
        cargo, // <--- Agora o frontend vai receber isso!
      },
      token,
    });
  }
}

module.exports = new SessaoController();