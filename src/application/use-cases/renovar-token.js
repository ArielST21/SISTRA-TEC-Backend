const { verificarRefreshToken, generarAccessToken } = require('../../infrastructure/auth/jwt-service');

async function renovarToken({ refreshToken }, usuarioRepo) {
  let payload;
  try {
    payload = verificarRefreshToken(refreshToken);
  } catch {
    const error = new Error('El token de refresco es inválido o ha expirado');
    error.statusCode = 401;
    error.codigo = 'REFRESH_TOKEN_INVALIDO';
    error.expose = true;
    throw error;
  }

  const usuario = await usuarioRepo.buscarPorId(payload.sub);
  if (!usuario || !usuario.isActive) {
    const error = new Error('El token de refresco es inválido o ha expirado');
    error.statusCode = 401;
    error.codigo = 'REFRESH_TOKEN_INVALIDO';
    error.expose = true;
    throw error;
  }

  const accessToken = generarAccessToken({
    sub: usuario.id,
    email: usuario.email,
    role: usuario.role,
    collectionCenterId: usuario.collectionCenterId || null,
  });

  return { accessToken };
}

module.exports = { renovarToken };
