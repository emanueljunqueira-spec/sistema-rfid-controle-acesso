// src/app/controllers/UsuarioController.js
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

class UsuarioController {
  // Método para listar todos os usuários (protegido)
  async index(req, res) {
    console.log('=> Acessando a rota para LISTAR usuários.');
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'cargo'],
    });
    return res.json(usuarios);
  }

  // Método para criar um novo usuário (público)
  async store(req, res) {
    // PONTO DE VERIFICAÇÃO 1: A requisição chegou aqui?
    console.log('=> 1. Acessando a rota para CRIAR usuário.');

    try {
      // PONTO DE VERIFICAÇÃO 2: O que estamos recebendo do cliente?
      console.log('=> 2. Dados recebidos no corpo (req.body):', req.body);
      const { nome, email, senha, cargo } = req.body;

      // Validação crucial: A senha foi enviada?
      if (!senha) {
        console.log('=> ERRO: Senha não foi fornecida no corpo da requisição.');
        return res.status(400).json({ error: 'O campo "senha" é obrigatório.' });
      }

      const usuarioExistente = await Usuario.findOne({ where: { email } });

      if (usuarioExistente) {
        console.log('=> 3. E-mail já existe, bloqueando cadastro.');
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      console.log('=> 3. E-mail disponível. Criptografando senha...');
      const senha_hash = await bcrypt.hash(senha, 8);
      console.log('=> 4. Senha criptografada com sucesso.');

      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha_hash,
        cargo,
      });
      console.log('=> 5. Usuário criado no banco de dados.');

      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
      });

    } catch (error) {
      // PONTO DE VERIFICAÇÃO FINAL: Se algo quebrou, o que foi?
      console.error('=> X. OCORREU UM ERRO NO BLOCO CATCH:', error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }
}

module.exports = new UsuarioController();