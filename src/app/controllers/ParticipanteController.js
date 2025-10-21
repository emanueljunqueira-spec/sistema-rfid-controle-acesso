// src/app/controllers/ParticipanteController.js
const Participante = require('../models/Participante');

class ParticipanteController {
  // Cadastrar um novo participante
  async store(req, res) {
    try {
      const { nome, email, status } = req.body;

      // Validação simples para evitar email duplicado
      if (email) {
        const participanteExistente = await Participante.findOne({ where: { email } });
        if (participanteExistente) {
          return res.status(400).json({ error: 'Este e-mail já está cadastrado para outro participante.' });
        }
      }

      const novoParticipante = await Participante.create({ nome, email, status });

      return res.status(201).json(novoParticipante);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }

  // Listar todos os participantes
  async index(req, res) {
    try {
      const participantes = await Participante.findAll({
        order: [['nome', 'ASC']], // Ordena por nome
      });
      return res.json(participantes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }
}

module.exports = new ParticipanteController();