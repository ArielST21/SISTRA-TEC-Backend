const { registrarDonante } = require('../../../application/use-cases/registrar-donante');
const { iniciarSesion } = require('../../../application/use-cases/iniciar-sesion');
const { renovarToken } = require('../../../application/use-cases/renovar-token');
const { solicitarResetPassword } = require('../../../application/use-cases/solicitar-reset-password');
const { verificarCodigoReset } = require('../../../application/use-cases/verificar-codigo-reset');
const { resetearPassword } = require('../../../application/use-cases/resetear-password');
const UsuarioRepositoryPg = require('../../../infrastructure/database/repositories/usuario-repository-pg');
const PasswordResetRepositoryPg = require('../../../infrastructure/database/repositories/password-reset-repository-pg');
const { enviarCodigoReset } = require('../../../infrastructure/email/email-service');
const env = require('../../../config/env');
const { exito } = require('../utils/respuesta');

const usuarioRepo = new UsuarioRepositoryPg();
const passwordResetRepo = new PasswordResetRepositoryPg();

async function register(req, res, next) {
  try {
    const { fullName, email, phone, address, password } = req.body;
    const resultado = await registrarDonante({ fullName, email, phone, address, password }, usuarioRepo);
    return res.status(201).json(exito(resultado, 'Cuenta creada exitosamente'));
  } catch (err) { return next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await iniciarSesion({ email, password }, usuarioRepo);
    return res.status(200).json(exito(resultado, 'Sesión iniciada exitosamente'));
  } catch (err) { return next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const resultado = await renovarToken({ refreshToken }, usuarioRepo);
    return res.status(200).json(exito(resultado, 'Token renovado exitosamente'));
  } catch (err) { return next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const { codigo } = await solicitarResetPassword(
      { email, ttlMinutos: env.passwordReset.codeTtlMinutes },
      { usuarioRepo, passwordResetRepo, enviarCodigoEmail: enviarCodigoReset },
    );

    const mensaje = `Si existe una cuenta asociada a ese correo, te enviamos un código de verificación. Revisa tu bandeja de entrada y spam. El código expira en ${env.passwordReset.codeTtlMinutes} minutos.`;
    const payload = { ttlMinutos: env.passwordReset.codeTtlMinutes };

    if (env.esDesarrollo && codigo) {
      payload.codigoDev = codigo;
    }

    return res.status(200).json(exito(payload, mensaje));
  } catch (err) { return next(err); }
}

async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;
    await verificarCodigoReset({ email, code }, { usuarioRepo, passwordResetRepo });
    return res.status(200).json(exito({ valido: true }, 'Código verificado correctamente'));
  } catch (err) { return next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    await resetearPassword({ email, code, newPassword }, { usuarioRepo, passwordResetRepo });
    return res.status(200).json(exito(null, 'Contraseña actualizada exitosamente'));
  } catch (err) { return next(err); }
}

module.exports = { register, login, refresh, forgotPassword, verifyResetCode, resetPassword };
