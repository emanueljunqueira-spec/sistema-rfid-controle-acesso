// src/app/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Transforma funções de callback em async/await
const authConfig = require('../../config/auth');

module.exports = async (req, res, next) => {
  // 1. Pega o token do cabeçalho da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer [token]". Vamos pegar só o token.
  const [, token] = authHeader.split(' ');

  try {
    // 2. Valida o token
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // 3. Se for válido, adiciona o ID do usuário na requisição
    // para que os controllers possam usá-lo
    req.usuarioId = decoded.id;

    // 4. Libera a passagem para o próximo passo (o controller)
    return next();
  } catch (err) {
    // Se o token for inválido, barra a entrada
    return res.status(401).json({ error: 'Token inválido.' });
  }
};