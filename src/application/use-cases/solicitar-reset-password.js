const crypto = require('crypto');
const { hashearPassword } = require('../../infrastructure/auth/password-service');

function generarCodigoNumerico(longitud = 6) {
  const max = 10 ** longitud;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(longitud, '0');
}

async function solicitarResetPassword(
  { email, ttlMinutos },
  { usuarioRepo, passwordResetRepo, enviarCodigoEmail },
) {
  const usuario = await usuarioRepo.buscarPorEmail(email);

  if (!usuario || !usuario.isActive) {
    return { codigo: null };
  }

  await passwordResetRepo.invalidarVigentesPorUsuario(usuario.id);

  const codigo = generarCodigoNumerico(6);
  const codeHash = await hashearPassword(codigo);
  const expiresAt = new Date(Date.now() + ttlMinutos * 60 * 1000);

  await passwordResetRepo.crear({
    userId: usuario.id,
    codeHash,
    expiresAt,
  });

  await enviarCodigoEmail({
    destinatario: usuario.email,
    nombre: usuario.fullName,
    codigo,
    minutos: ttlMinutos,
  });

  return { codigo };
}

module.exports = { solicitarResetPassword };
