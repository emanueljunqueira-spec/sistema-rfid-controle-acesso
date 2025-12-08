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
      // Agora pegamos o email também
      const { emailConfirmacao, senhaConfirmacao } = req.body;

      // 1. Quem está pedindo? (Admin logado)
      const adminLogado = await Usuario.findByPk(req.usuarioId);
      if (!adminLogado) return res.status(401).json({ error: 'Usuário não autenticado.' });

      // 2. Verifica cargo
      if (adminLogado.cargo !== 'administrador') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir eventos.' });
      }

      // 3. Verifica E-mail (NOVO)
      // Sanitização para evitar erros bobos de espaço ou maiúscula
      const emailBanco = adminLogado.email.trim().toLowerCase();
      const emailDigitado = (emailConfirmacao || '').trim().toLowerCase();

      if (emailBanco !== emailDigitado) {
        return res.status(401).json({ 
          error: 'O e-mail de confirmação não confere com o usuário logado.' 
        });
      }

      // 4. Verifica Senha
      if (!senhaConfirmacao) {
        return res.status(400).json({ error: 'Senha obrigatória para confirmar exclusão.' });
      }

      const senhaValida = await bcrypt.compare(senhaConfirmacao, adminLogado.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      // 5. Busca e Deleta o Evento
      const evento = await Evento.findByPk(id); // <--- Atenção: Buscando na tabela de Eventos!

      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await evento.destroy();
      return res.json({ message: 'Evento excluído com sucesso.' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro interno ao excluir evento.' });
    }
  }
} // Fim da classe EventoController


module.exports = new EventoController();
