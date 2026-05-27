async function obtenerDonacion(id, donorId, donacionRepo) {
  const donacion = await donacionRepo.buscarPorIdEnriquecida(id);

  if (!donacion) {
    const error = new Error('Donación no encontrada');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  if (donacion.donorId !== donorId) {
    const error = new Error('No tiene permisos para ver esta donación');
    error.statusCode = 403;
    error.codigo = 'ACCESO_DENEGADO';
    error.expose = true;
    throw error;
  }

  return donacion;
}

module.exports = { obtenerDonacion };
