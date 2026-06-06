const { verificarPassword } = require('../../infrastructure/auth/password-service');
const { generarParDeTokens } = require('../../infrastructure/auth/jwt-service');

async function iniciarSesion({ email, password }, usuarioRepo) {
  const usuario = await usuarioRepo.buscarPorEmail(email);

  const credencialesValidas = usuario && await verificarPassword(password, usuario.passwordHash);
  if (!credencialesValidas) {
    const error = new Error('Correo o contraseña incorrectos');
    error.statusCode = 401;
    error.codigo = 'CREDENCIALES_INVALIDAS';
    error.expose = true;
    throw error;
  }

  if (!usuario.isActive) {
    const error = new Error('Esta cuenta ha sido desactivada');
    error.statusCode = 403;
    error.codigo = 'CUENTA_INACTIVA';
    error.expose = true;
    throw error;
  }

  const tokens = generarParDeTokens(usuario);
  return { usuario: usuario.aJson(), ...tokens };
}

module.exports = { iniciarSesion };
