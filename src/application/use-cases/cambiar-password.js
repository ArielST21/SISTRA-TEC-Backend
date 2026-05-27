const { hashearPassword, verificarPassword } = require('../../infrastructure/auth/password-service');

async function cambiarPassword({ usuarioId, currentPassword, newPassword }, usuarioRepo) {
  const usuario = await usuarioRepo.buscarPorId(usuarioId);
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    error.codigo = 'USUARIO_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  const passwordCorrecta = await verificarPassword(currentPassword, usuario.passwordHash);
  if (!passwordCorrecta) {
    const error = new Error('La contraseña actual es incorrecta');
    error.statusCode = 401;
    error.codigo = 'PASSWORD_ACTUAL_INCORRECTA';
    error.expose = true;
    throw error;
  }

  const nuevoHash = await hashearPassword(newPassword);
  await usuarioRepo.actualizarPassword(usuarioId, nuevoHash);
}

module.exports = { cambiarPassword };
