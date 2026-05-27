const Usuario = require('../../domain/entities/usuario');
const { ROLES } = require('../../domain/entities/rol-usuario');
const { hashearPassword } = require('../../infrastructure/auth/password-service');

async function crearUsuarioStaff(
  { fullName, email, phone, address, password, role, vehicle, collectionCenterId },
  usuarioRepo,
) {
  if (role !== ROLES.TRANSPORTISTA && role !== ROLES.ADMINISTRADOR) {
    const error = new Error('Solo se pueden crear usuarios con rol admin o transporter desde este endpoint');
    error.statusCode = 400;
    error.codigo = 'ROL_NO_PERMITIDO';
    error.expose = true;
    throw error;
  }

  const passwordHash = await hashearPassword(password);
  const nuevoUsuario = new Usuario({
    fullName,
    email,
    passwordHash,
    role,
    address,
    phone,
    vehicle: role === ROLES.TRANSPORTISTA ? vehicle || null : null,
    collectionCenterId: collectionCenterId || null,
  });

  const guardado = await usuarioRepo.crear(nuevoUsuario);
  return guardado.aJson();
}

module.exports = { crearUsuarioStaff };
