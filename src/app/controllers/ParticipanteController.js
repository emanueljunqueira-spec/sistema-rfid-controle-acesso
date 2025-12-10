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
      const { nome, email, status, evento_id } = req.body;
      if (email) {
        const existe = await Participante.findOne({ where: { email } });
        if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
      const novo = await Participante.create({ nome, email, status, evento_id });
      return res.status(201).json(novo);
    } catch (err) {
      console.error('Erro ao criar participante:', err);
      return res.status(500).json({ error: 'Erro ao criar participante.' });
    }
  }

  // NOVO MÉTODO: EXCLUIR PARTICIPANTE
  async delete(req, res) {
    try {
      const { id } = req.params;
      // AGORA: Recebemos email e senha para re-autenticação total
      const { emailConfirmacao, senhaConfirmacao } = req.body; 

      // 1. Busca o admin que está logado (pelo ID do token)
      const adminLogado = await Usuario.findByPk(req.usuarioId);
      
      if (!adminLogado) return res.status(401).json({ error: 'Usuário não autenticado.' });

      if (adminLogado.cargo !== 'administrador') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir.' });
      }

      // 2. NOVA CAMADA: Verifica se o E-mail de confirmação bate com o do admin logado
      if (emailConfirmacao !== adminLogado.email) {
        return res.status(401).json({ error: 'O e-mail de confirmação não confere com o usuário logado.' });
      }

      // 3. Verifica a senha
      if (!senhaConfirmacao) return res.status(400).json({ error: 'Senha de confirmação necessária.' });
      
      const senhaValida = await bcrypt.compare(senhaConfirmacao, adminLogado.senha_hash);
      if (!senhaValida) return res.status(401).json({ error: 'Senha de confirmação incorreta.' });

      // 4. Lógica de exclusão do alvo
      const alvo = await Participante.findByPk(id); 
      
      if (!alvo) {
        return res.status(404).json({ error: 'Participante não encontrado.' });
      }

      await alvo.destroy();
      return res.json({ message: 'Participante excluído com sucesso.' });

    } catch (err) {
      console.log(err); // Bom para debug
      return res.status(500).json({ error: 'Erro interno ao excluir participante.' });
    }
  }
}

module.exports = new ParticipanteController();