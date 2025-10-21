// src/app/controllers/CartaoRFIDController.js
const CartaoRFID = require('../models/CartaoRFID');
const Participante = require('../models/Participante');

class CartaoRFIDController {
  // Cadastrar um novo cartão e vincular a um participante
  async store(req, res) {
    try {
      const { codigo_rfid, participante_id } = req.body;

      // 1. Verifica se o cartão já existe
      const cartaoExistente = await CartaoRFID.findOne({ where: { codigo_rfid } });
      if (cartaoExistente) {
        return res.status(400).json({ error: 'Este código RFID já está cadastrado.' });
      }

      // 2. Verifica se o participante informado existe
      const participante = await Participante.findByPk(participante_id);
      if (!participante) {
        return res.status(404).json({ error: 'Participante não encontrado.' });
      }

      // 3. Cria o cartão
      const novoCartao = await CartaoRFID.create({ codigo_rfid, participante_id });

      return res.status(201).json(novoCartao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }

  // Listar todos os cartões
  async index(req, res) {
    try {
      const cartoes = await CartaoRFID.findAll({
        // Aqui está a mágica da associação!
        // Incluímos os dados do participante vinculado ao cartão.
        include: {
          model: Participante,
          as: 'participante', // O 'as' que definimos no Model
          attributes: ['id', 'nome', 'email'], // Apenas os campos que queremos
        },
        order: [['registrado_em', 'DESC']], // Ordena pelos mais recentes
      });

      return res.json(cartoes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }
}

module.exports = new CartaoRFIDController();