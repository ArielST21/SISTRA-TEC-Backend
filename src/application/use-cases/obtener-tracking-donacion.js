async function obtenerTrackingDonacion(donacionId, { donacionRepo, trackingEventRepo }) {
  const donacion = await donacionRepo.buscarPorId(donacionId);
  if (!donacion) {
    const error = new Error('Donación no encontrada');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  const eventos = await trackingEventRepo.listarPorDonacion(donacionId);
  return eventos;
}

module.exports = { obtenerTrackingDonacion };
