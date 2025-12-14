const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');
const { CARGOS } = require('../utils/rbac'); // Certifique-se que rbac exporta CARGOS

class EventoController {
  
  // LISTAR EVENTOS (Público para logados)
  async index(req, res) {
    try {
      const eventos = await Evento.findAll({
        order: [['data_evento', 'DESC']],
      });
      return res.json(eventos);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar eventos.' });
    }
  }

  // CRIAR EVENTO (Restrito: Admin/Gerente)
  async store(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { titulo, descricao, data_evento, local, status } = req.body;

      // 1. Verifica permissão
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });
      if (usuarioLogado.cargo === CARGOS.OPERADOR) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Operadores não podem criar eventos.' });
      }

      if (!titulo || !data_evento || !local) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Título, Data e Local são obrigatórios.' });
      }

      const novo = await Evento.create({
        titulo, descricao, data_evento, local, status
      }, { transaction });

      await transaction.commit();
      return res.status(201).json(novo);

    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Erro ao criar evento.' });
    }
  }

  // ATUALIZAR EVENTO
  async update(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const dados = req.body;

      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });
      if (usuarioLogado.cargo === CARGOS.OPERADOR) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Operadores não podem editar eventos.' });
      }

      const evento = await Evento.findByPk(id, { transaction });
      if (!evento) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await evento.update(dados, { transaction });
      await transaction.commit();
      return res.json(evento);

    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Erro ao atualizar evento.' });
    }
  }

  // EXCLUIR EVENTO (Zona de Perigo - Com Senha)
  async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { emailConfirmacao, senhaConfirmacao } = req.body;

      // 1. Segurança: Busca Admin Logado
      const usuarioLogado = await Usuario.findByPk(req.usuarioId, { transaction });

      // 2. Permissão: Operador não deleta evento
      if (usuarioLogado.cargo === CARGOS.OPERADOR) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Operadores não podem excluir eventos.' });
      }

      // 3. Re-autenticação (Sudo Mode)
      if (emailConfirmacao !== usuarioLogado.email) {
        await transaction.rollback();
        return res.status(401).json({ error: 'E-mail de confirmação incorreto.' });
      }

      const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioLogado.senha_hash);
      if (!senhaValida) {
        await transaction.rollback();
        return res.status(401).json({ error: 'Senha de confirmação incorreta.' });
      }

      // 4. Executa a exclusão
      const evento = await Evento.findByPk(id, { transaction });
      if (!evento) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await evento.destroy({ transaction });
      await transaction.commit();

      return res.json({ message: 'Evento excluído com sucesso.' });

    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Erro ao excluir evento. Verifique se há participantes vinculados.' });
    }
  }

  // LISTAR PARTICIPANTES (Para a Timeline)
  async listarParticipantes(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findByPk(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado.' });

      // Busca participantes deste evento
      const participantes = await evento.getParticipantes({
        include: [
          {
            association: 'cartoes',
            include: [{ association: 'registros' }] // Traz o histórico completo
          }
        ]
      });

      // Formata os dados para o Frontend (Timeline)
      const participantesFormatados = participantes.map(p => {
        let historicoAcessos = [];
        let statusPresenca = 'sem_registro';

        // Compila todos os registros de todos os cartões desse participante
        if (p.cartoes && p.cartoes.length > 0) {
          p.cartoes.forEach(cartao => {
            if (cartao.registros) {
              cartao.registros.forEach(registro => {
                historicoAcessos.push({
                  id: registro.id,
                  tipo: registro.tipo_movimento,
                  data_hora: registro.hora_evento,
                  mensagem: registro.mensagem
                });
              });
            }
          });

          // Ordena do mais recente para o mais antigo
          historicoAcessos.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

          if (historicoAcessos.length > 0) {
            statusPresenca = historicoAcessos[0].tipo; // O último define o status atual
          }
        }

        return {
          id: p.id,
          nome: p.nome,
          email: p.email,
          status_cadastro: p.status,
          status_presenca: statusPresenca,
          historico_acessos: historicoAcessos // Enviamos a lista completa para a timeline visual
        };
      });

      return res.json({
        evento,
        participantes: participantesFormatados
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar dados do evento.' });
    }
  }
}

module.exports = new EventoController();