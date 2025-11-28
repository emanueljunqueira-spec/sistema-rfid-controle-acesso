const Participante = require('../models/Participante');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

class ParticipanteController {
  async index(req, res) {
    const participantes = await Participante.findAll({ order: [['nome', 'ASC']] });
    return res.json(participantes);
  }

  async store(req, res) {
    try {
      const { nome, email, status } = req.body;
      if (email) {
        const existe = await Participante.findOne({ where: { email } });
        if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
      const novo = await Participante.create({ nome, email, status });
      return res.status(201).json(novo);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar participante.' });
    }
  }

  // NOVO MÉTODO: EXCLUIR PARTICIPANTE
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { senhaConfirmacao } = req.body;

      // 1. Verifica Admin
      const adminLogado = await Usuario.findByPk(req.usuarioId);
      if (adminLogado.cargo !== 'administrador') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir.' });
      }

      // 2. Confirma Senha
      if (!senhaConfirmacao) return res.status(400).json({ error: 'Senha obrigatória.' });
      const senhaValida = await bcrypt.compare(senhaConfirmacao, adminLogado.senha_hash);
      if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta.' });

      // 3. Exclui
      const participante = await Participante.findByPk(id);
      if (!participante) return res.status(404).json({ error: 'Participante não encontrado.' });

      await participante.destroy();
      return res.json({ message: 'Participante excluído.' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao excluir participante.' });
    }
  }
}

module.exports = new ParticipanteController();