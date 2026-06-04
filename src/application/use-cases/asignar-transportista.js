const { ESTADOS_DONACION } = require('../../domain/entities/estado-donacion');

async function asignarTransportista(
  { donacionId, transporterId, destination },
  { donacionRepo, usuarioRepo, asignacionRepo },
) {
  const donacion = await donacionRepo.buscarPorId(donacionId);
  if (!donacion) {
    const error = new Error('Donación no encontrada');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  if (donacion.status !== ESTADOS_DONACION.RECIBIDO) {
    const error = new Error('Solo se puede asignar un transportista a donaciones en estado "recibido"');
    error.statusCode = 409;
    error.codigo = 'ESTADO_NO_ASIGNABLE';
    error.expose = true;
    throw error;
  }

  const transportista = await usuarioRepo.buscarPorId(transporterId);
  if (!transportista) {
    const error = new Error('El transportista no existe');
    error.statusCode = 404;
    error.codigo = 'TRANSPORTISTA_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  if (transportista.role !== 'transporter') {
    const error = new Error('El usuario indicado no es un transportista');
    error.statusCode = 400;
    error.codigo = 'USUARIO_NO_TRANSPORTISTA';
    error.expose = true;
    throw error;
  }

  if (!transportista.isActive) {
    const error = new Error('El transportista no está activo');
    error.statusCode = 409;
    error.codigo = 'TRANSPORTISTA_INACTIVO';
    error.expose = true;
    throw error;
  }

  const asignacionExistente = await asignacionRepo.buscarPorDonacion(donacionId);
  if (asignacionExistente) {
    const error = new Error('Esta donación ya tiene un transportista asignado');
    error.statusCode = 409;
    error.codigo = 'DONACION_YA_ASIGNADA';
    error.expose = true;
    throw error;
  }

  if (!transportista.vehicle) {
    const error = new Error('El transportista no tiene un vehículo registrado en su perfil');
    error.statusCode = 409;
    error.codigo = 'TRANSPORTISTA_SIN_VEHICULO';
    error.expose = true;
    throw error;
  }

  const asignacion = await asignacionRepo.crear({
    donationId: donacionId,
    transporterId,
    vehicleDescription: transportista.vehicle,
    destination,
  });

  return asignacion;
}

module.exports = { asignarTransportista };
