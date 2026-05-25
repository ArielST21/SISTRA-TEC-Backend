const { verificarAccessToken } = require('../../../infrastructure/auth/jwt-service');
const { fallo } = require('../utils/respuesta');

function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(
      fallo('Token de autenticación no proporcionado', 'TOKEN_AUSENTE'),
    );
  }

  const token = header.slice(7).trim();

  try {
    const payload = verificarAccessToken(token);
    req.usuario = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      collectionCenterId: payload.collectionCenterId || null,
    };
    return next();
  } catch (err) {
    const codigo = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO';
    return res.status(401).json(
      fallo('Token de autenticación inválido o expirado', codigo, err.message),
    );
  }
}

module.exports = { autenticar };
