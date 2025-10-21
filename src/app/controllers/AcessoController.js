// src/app/controllers/AcessoController.js
const { Op } = require('sequelize');
const CartaoRFID = require('../models/CartaoRFID');
const RegistroAcesso = require('../models/RegistroAcesso');
const Participante = require('../models/Participante');

class AcessoController {
  // Método principal que o ESP32 vai chamar
  async store(req, res) {
    const { codigo_rfid } = req.body;

    try {
      // 1. Encontra o cartão no banco, já incluindo os dados do participante
      const cartao = await CartaoRFID.findOne({
        where: { codigo_rfid },
        include: { model: Participante, as: 'participante' },
      });

      // 2. Validação: O cartão existe?
      if (!cartao) {
        await RegistroAcesso.create({
          tipo_movimento: 'negado',
          mensagem: 'Cartão desconhecido.',
          // Note que não temos 'cartao_id' porque ele não foi encontrado
        });
        return res.status(404).json({
          status: 'negado',
          mensagem: 'Cartão não cadastrado.',
        });
      }

      // 3. Validação: O cartão está ativo e vinculado a um participante?
      if (!cartao.ativo || !cartao.participante) {
        await RegistroAcesso.create({
          cartao_id: cartao.id,
          tipo_movimento: 'negado',
          mensagem: 'Cartão inativo ou não vinculado.',
        });
        return res.status(403).json({
          status: 'negado',
          mensagem: 'Cartão inativo ou sem participante.',
        });
      }

      // 4. Lógica de ENTRADA ou SAÍDA:
      // Busca o último registro VÁLIDO (entrada ou saida) deste cartão
      const ultimoRegistro = await RegistroAcesso.findOne({
        where: {
          cartao_id: cartao.id,
          tipo_movimento: { [Op.in]: ['entrada', 'saida'] },
        },
        order: [['hora_evento', 'DESC']],
      });

      let proximoMovimento = 'entrada';
      // Se não houver nenhum registro, o próximo é 'entrada'
      // Se o último registro foi uma 'entrada', o próximo é 'saida'
      if (ultimoRegistro && ultimoRegistro.tipo_movimento === 'entrada') {
        proximoMovimento = 'saida';
      }

      // 5. Cria o novo registro de acesso no banco
      await RegistroAcesso.create({
        cartao_id: cartao.id,
        tipo_movimento: proximoMovimento,
        mensagem: `Acesso ${proximoMovimento === 'entrada' ? 'liberado' : 'registrado'}.`,
      });

      // 6. Responde ao ESP32 com sucesso
      return res.status(200).json({
        status: 'autorizado',
        tipo_movimento: proximoMovimento,
        participante: cartao.participante.nome,
        mensagem: `Acesso ${proximoMovimento} liberado.`,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }

  // (Opcional) Método para listar todos os registros de acesso
  async index(req, res) {
    const registros = await RegistroAcesso.findAll({
      include: {
        model: CartaoRFID,
        as: 'cartao',
        attributes: ['codigo_rfid'],
        include: {
          model: Participante,
          as: 'participante',
          attributes: ['nome'],
        },
      },
      order: [['hora_evento', 'DESC']],
      limit: 100, // Limita aos últimos 100 registros para não sobrecarregar
    });

    return res.json(registros);
  }
}

module.exports = new AcessoController();