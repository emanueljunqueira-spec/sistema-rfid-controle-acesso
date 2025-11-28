const { z } = require('zod');

const storeSchema = z.object({
  titulo: z
    .string({ required_error: 'O título é obrigatório' })
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres'),
  
  descricao: z
    .string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  
  data_evento: z
    .string({ required_error: 'A data do evento é obrigatória' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'A data do evento deve estar em formato válido'
    }),
  
  local: z
    .string({ required_error: 'O local é obrigatório' })
    .min(3, 'O local deve ter no mínimo 3 caracteres')
    .max(150, 'O local deve ter no máximo 150 caracteres'),
  
  status: z
    .enum(['ativo', 'inativo', 'cancelado', 'finalizado'], {
      errorMap: () => ({ message: 'O status deve ser: ativo, inativo, cancelado ou finalizado' })
    })
    .optional()
});

const updateSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres')
    .optional(),
  
  descricao: z
    .string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  
  data_evento: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'A data do evento deve estar em formato válido'
    })
    .optional(),
  
  local: z
    .string()
    .min(3, 'O local deve ter no mínimo 3 caracteres')
    .max(150, 'O local deve ter no máximo 150 caracteres')
    .optional(),
  
  status: z
    .enum(['ativo', 'inativo', 'cancelado', 'finalizado'], {
      errorMap: () => ({ message: 'O status deve ser: ativo, inativo, cancelado ou finalizado' })
    })
    .optional()
});

// Middleware para validação com Zod
const store = (req, res, next) => {
  const result = storeSchema.safeParse(req.body);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return res.status(400).json({ errors });
  }
  
  next();
};

const update = (req, res, next) => {
  const result = updateSchema.safeParse(req.body);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  store,
  update
};