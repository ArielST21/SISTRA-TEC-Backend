const jwt = require('jsonwebtoken');
const env = require('../../config/env');

function generarAccessToken(payload) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
    issuer: 'sistratec-api',
  });
}

function generarRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: 'sistratec-api',
  });
}

function verificarAccessToken(token) {
  return jwt.verify(token, env.jwt.secret, { issuer: 'sistratec-api' });
}

function verificarRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret, { issuer: 'sistratec-api' });
}

function generarParDeTokens(usuario) {
  const payload = {
    sub: usuario.id,
    email: usuario.email,
    role: usuario.role,
    collectionCenterId: usuario.collectionCenterId || null,
  };
  return {
    accessToken: generarAccessToken(payload),
    refreshToken: generarRefreshToken({ sub: usuario.id }),
  };
}

module.exports = {
  generarAccessToken,
  generarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  generarParDeTokens,
};
