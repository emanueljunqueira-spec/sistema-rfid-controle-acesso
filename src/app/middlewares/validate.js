// src/app/middlewares/validate.js
const validate = (schema) => async (req, res, next) => {
  try {
    // Valida o corpo da requisição contra o schema fornecido
    await schema.parseAsync(req.body);
    // Se a validação for bem-sucedida, continua para o próximo passo (o controller)
    return next();
  } catch (error) {
    // Se a validação falhar, o Zod joga um erro.
    // Nós o capturamos e enviamos uma resposta 400 (Bad Request)
    // com os detalhes do erro formatados.
    return res.status(400).json({
      message: 'Erro de validação.',
      errors: error.flatten().fieldErrors,
    });
  }
};

module.exports = validate;