const { hashearPassword, verificarPassword } = require('../../infrastructure/auth/password-service');

async function resetearPassword(
  { email, code, newPassword },
  { usuarioRepo, passwordResetRepo },
) {
  const usuario = await usuarioRepo.buscarPorEmail(email);

  const errorGenerico = () => {
    const error = new Error('El código es inválido o ha expirado');
    error.statusCode = 400;
    error.codigo = 'CODIGO_INVALIDO';
    error.expose = true;
    return error;
  };

  if (!usuario) throw errorGenerico();

  const reset = await passwordResetRepo.buscarVigentePorUsuario(usuario.id);
  if (!reset) throw errorGenerico();

  const coincide = await verificarPassword(code, reset.codeHash);
  if (!coincide) throw errorGenerico();

  const nuevoHash = await hashearPassword(newPassword);
  await usuarioRepo.actualizarPassword(usuario.id, nuevoHash);
  await passwordResetRepo.marcarConsumido(reset.id);
}

module.exports = { resetearPassword };
