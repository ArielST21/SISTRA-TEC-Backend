const bcrypt = require('bcrypt');
const env = require('../../config/env');

async function hashearPassword(passwordPlano) {
  if (!passwordPlano || typeof passwordPlano !== 'string') {
    throw new Error('hashearPassword: la contraseña debe ser un string no vacío');
  }
  return bcrypt.hash(passwordPlano, env.bcryptRounds);
}

async function verificarPassword(passwordPlano, hash) {
  if (!passwordPlano || !hash) return false;
  return bcrypt.compare(passwordPlano, hash);
}

module.exports = { hashearPassword, verificarPassword };
