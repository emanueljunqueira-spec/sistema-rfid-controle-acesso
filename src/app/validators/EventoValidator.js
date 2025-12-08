const { z } = require('zod');

const store = z.object({
  titulo: z.string({ required_error: 'O título é obrigatório' })
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres'),
  
  // No Zod, para aceitar null ou vazio opcional, usamos nullable e optional
  descricao: z.string().max(500).optional().nullable(),
  
  // Validamos se é uma string que vira data
  data_evento: z.string({ required_error: 'A data é obrigatória' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Formato de data inválido' }),
  
  local: z.string({ required_error: 'O local é obrigatório' }),
  
  status: z.enum(['ativo', 'inativo', 'cancelado', 'finalizado']).optional(),
});

const update = store.partial(); // Cria um validador igual ao store, mas tudo opcional para Updates

module.exports = { store, update };