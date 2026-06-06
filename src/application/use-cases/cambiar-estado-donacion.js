const { esTransicionValida } = require('../../domain/entities/estado-donacion');

async function cambiarEstadoDonacion(
  { donacionId, nuevoEstado, usuarioId, validarPropiedad },
  { donacionRepo, trackingEventRepo },
) {
  const donacion = await donacionRepo.buscarPorId(donacionId);

  if (!donacion) {
    const error = new Error('Donación no encontrada');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  if (donacion.estaBloqueada()) {
    const error = new Error('Esta donación ya fue entregada y no se puede modificar');
    error.statusCode = 409;
    error.codigo = 'DONACION_BLOQUEADA';
    error.expose = true;
    throw error;
  }

  if (!esTransicionValida(donacion.status, nuevoEstado)) {
    const error = new Error(
      `No se puede pasar de "${donacion.status}" a "${nuevoEstado}". Las transiciones son secuenciales.`,
    );
    error.statusCode = 409;
    error.codigo = 'TRANSICION_INVALIDA';
    error.expose = true;
    throw error;
  }

  if (validarPropiedad) {
    await validarPropiedad(donacion);
  }

  const estadoAnterior = donacion.status;
  let donacionActualizada;

  if (nuevoEstado === 'entregado') {
    donacionActualizada = await donacionRepo.marcarEntregada(donacionId);
  } else {
    donacionActualizada = await donacionRepo.actualizarEstado(donacionId, nuevoEstado);
  }

  await trackingEventRepo.registrar({
    donationId: donacionId,
    changedBy: usuarioId,
    fromStatus: estadoAnterior,
    toStatus: nuevoEstado,
  });

  return donacionActualizada;
}

module.exports = { cambiarEstadoDonacion };
