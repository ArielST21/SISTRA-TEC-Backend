const { ESTADOS_DONACION } = require('../../domain/entities/estado-donacion');

async function cancelarDonacion(donacionId, donorId, donacionRepo) {
  const donacion = await donacionRepo.buscarPorId(donacionId);

  if (!donacion) {
    const error = new Error('Donación no encontrada');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  if (donacion.donorId !== donorId) {
    const error = new Error('No tiene permisos para cancelar esta donación');
    error.statusCode = 403;
    error.codigo = 'ACCESO_DENEGADO';
    error.expose = true;
    throw error;
  }

  if (donacion.status !== ESTADOS_DONACION.RECIBIDO) {
    const error = new Error('Solo se pueden cancelar donaciones que aún están en estado "recibido"');
    error.statusCode = 409;
    error.codigo = 'CANCELACION_NO_PERMITIDA';
    error.expose = true;
    throw error;
  }

  await donacionRepo.cancelar(donacionId);
}

module.exports = { cancelarDonacion };
