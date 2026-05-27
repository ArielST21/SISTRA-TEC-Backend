const { verificarPassword } = require('../../infrastructure/auth/password-service');

async function verificarCodigoReset(
  { email, code },
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

  return { valido: true };
}

module.exports = { verificarCodigoReset };
