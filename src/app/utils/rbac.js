/**
 * RBAC (Role-Based Access Control)
 * Centraliza as regras de "Quem pode fazer o quê".
 */

const CARGOS = {
  ADMINISTRADOR: 'administrador',
  GERENTE: 'gerente',
  OPERADOR: 'operador'
};

// Matriz: Quem pode CRIAR usuários de qual tipo?
const regrasCriacaoUsuario = {
  [CARGOS.ADMINISTRADOR]: [CARGOS.ADMINISTRADOR, CARGOS.GERENTE, CARGOS.OPERADOR],
  [CARGOS.GERENTE]: [CARGOS.OPERADOR], // Gerente só cria Operador
  [CARGOS.OPERADOR]: [] // Operador não cria usuário de sistema
};

// Matriz: Quem pode DELETAR usuários de qual tipo?
const regrasExclusaoUsuario = {
  [CARGOS.ADMINISTRADOR]: [CARGOS.GERENTE, CARGOS.OPERADOR], // Admin deleta tudo (menos a si mesmo via lógica do controller)
  [CARGOS.GERENTE]: [CARGOS.OPERADOR], // Gerente só deleta Operador
  [CARGOS.OPERADOR]: [] // Operador não deleta usuário de sistema
};

module.exports = {
  CARGOS,

  /**
   * Verifica se pode CRIAR um novo USUÁRIO do sistema
   */
  podeCriarUsuario(cargoSolicitante, cargoNovoUsuario) {
    const permitidos = regrasCriacaoUsuario[cargoSolicitante] || [];
    return permitidos.includes(cargoNovoUsuario);
  },

  /**
   * Verifica se pode DELETAR um USUÁRIO do sistema
   */
  podeDeletarUsuario(cargoSolicitante, cargoAlvo) {
    // Regra especial: Ninguém deleta Administrador (exceto via banco ou SuperAdmin se houver)
    // Para simplificar: Admin pode deletar Admin, mas o Controller deve impedir auto-exclusão.
    if (cargoSolicitante === CARGOS.ADMINISTRADOR && cargoAlvo === CARGOS.ADMINISTRADOR) {
      return true; 
    }
    const permitidos = regrasExclusaoUsuario[cargoSolicitante] || [];
    return permitidos.includes(cargoAlvo);
  },

  /**
   * Verifica se pode gerenciar (criar/editar/excluir) PARTICIPANTES
   * Regra: Todo mundo pode, exceto se quisermos bloquear algo futuro.
   */
  podeGerenciarParticipantes(cargoSolicitante) {
    // Admin, Gerente e Operador podem gerenciar participantes
    return [CARGOS.ADMINISTRADOR, CARGOS.GERENTE, CARGOS.OPERADOR].includes(cargoSolicitante);
  }
};