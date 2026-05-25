const Usuario = require('../../domain/entities/usuario');
const { ROLES } = require('../../domain/entities/rol-usuario');
const { hashearPassword } = require('../../infrastructure/auth/password-service');
const { generarParDeTokens } = require('../../infrastructure/auth/jwt-service');

async function registrarDonante({ fullName, email, phone, address, password }, usuarioRepo) {
  const passwordHash = await hashearPassword(password);

  const nuevoUsuario = new Usuario({
    fullName,
    email,
    passwordHash,
    role: ROLES.DONANTE,
    address,
    phone,
  });

  const usuarioGuardado = await usuarioRepo.crear(nuevoUsuario);
  const tokens = generarParDeTokens(usuarioGuardado);

  return {
    usuario: usuarioGuardado.aJson(),
    ...tokens,
  };
}

module.exports = { registrarDonante };
