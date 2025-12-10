const Evento = require('../models/Evento');
const Participante = require('../models/Participante');
const CartaoRFID = require('../models/CartaoRFID');
const RegistroAcesso = require('../models/RegistroAcesso');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

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

  // LISTAR PARTICIPANTES DE UM EVENTO COM STATUS DE PRESENÇA
  async listarParticipantes(req, res) {
    try {
      const { id } = req.params;

      // 1. Verifica se o evento existe
      const evento = await Evento.findByPk(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      // 2. Busca participantes do evento com seus cartões e último registro de acesso
      const participantes = await Participante.findAll({
        where: { evento_id: id },
        include: [
          {
            model: CartaoRFID,
            as: 'cartoes',
            include: [
              {
                model: RegistroAcesso,
                as: 'registros',
                order: [['hora_evento', 'DESC']],
                limit: 1,
              },
            ],
          },
        ],
        order: [['nome', 'ASC']],
      });

      // 3. Formata a resposta com status de presença
      const participantesFormatados = participantes.map((p) => {
        // Pega o último registro de acesso (se houver)
        let ultimoRegistro = null;
        let statusPresenca = 'sem_registro';

        if (p.cartoes && p.cartoes.length > 0) {
          // Percorre todos os cartões para encontrar o registro mais recente
          p.cartoes.forEach((cartao) => {
            if (cartao.registros && cartao.registros.length > 0) {
              const registro = cartao.registros[0];
              if (!ultimoRegistro || new Date(registro.hora_evento) > new Date(ultimoRegistro.hora_evento)) {
                ultimoRegistro = registro;
              }
            }
          });

          if (ultimoRegistro) {
            statusPresenca = ultimoRegistro.tipo_movimento; // 'entrada', 'saida', 'negado'
          }
        }

        return {
          id: p.id,
          nome: p.nome,
          email: p.email,
          status_cadastro: p.status, // status do cadastro (ativo/inativo)
          status_presenca: statusPresenca, // 'entrada', 'saida', 'negado', 'sem_registro'
          ultimo_registro: ultimoRegistro
            ? {
                tipo: ultimoRegistro.tipo_movimento,
                data_hora: ultimoRegistro.hora_evento,
                mensagem: ultimoRegistro.mensagem,
              }
            : null,
        };
      });

      return res.json({
        evento: {
          id: evento.id,
          titulo: evento.titulo,
          data_evento: evento.data_evento,
          local: evento.local,
          status: evento.status,
        },
        participantes: participantesFormatados,
        total: participantesFormatados.length,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro ao listar participantes do evento.' });
    }
  }
} // Fim da classe EventoController


module.exports = new EventoController();
