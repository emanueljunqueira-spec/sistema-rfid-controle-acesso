const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

class EventoController {
  
  // LISTAR EVENTOS
  async index(req, res) {
    try {
      const eventos = await Evento.findAll({
        order: [['data_evento', 'ASC']],
      });

      return res.json(eventos);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao listar eventos.' });
    }
  }

  // CRIAR EVENTO
  async store(req, res) {
    try {
      const { titulo, descricao, data_evento, local, status } = req.body;

      if (!titulo) {
        return res.status(400).json({ error: 'Título é obrigatório.' });
      }

      if (!data_evento) {
        return res.status(400).json({ error: 'Data do evento é obrigatória.' });
      }

      const novo = await Evento.create({
        titulo,
        descricao,
        data_evento,
        local,
        status,
      });

      return res.status(201).json(novo);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao criar evento.' });
    }
  }

  // EDITAR EVENTO
  async update(req, res) {
    try {
      const { id } = req.params;

      const evento = await Evento.findByPk(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await evento.update(req.body);
      return res.json(evento);

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao atualizar evento.' });
    }
  }

  // DELETAR EVENTO (APENAS ADMIN)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { senhaConfirmacao } = req.body;

      // 1 — Verificar se é admin
      const adminLogado = await Usuario.findByPk(req.usuarioId);

      if (!adminLogado || adminLogado.cargo !== 'administrador') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir eventos.' });
      }

      // 2 — Verifica senha
      if (!senhaConfirmacao) {
        return res.status(400).json({ error: 'Senha obrigatória para confirmar exclusão.' });
      }

      const senhaValida = await bcrypt.compare(
        senhaConfirmacao,
        adminLogado.senha_hash
      );

      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      // 3 — Verifica evento
      const evento = await Evento.findByPk(id);

      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await evento.destroy();

      return res.json({ message: 'Evento excluído com sucesso.' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao excluir evento.' });
    }
  }
}

module.exports = new EventoController();
