function ofuscarNombreDonante(nombreCompleto) {
  if (!nombreCompleto) return null;
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  const primerNombre = partes[0];
  const inicialApellido = partes[partes.length - 1].charAt(0).toUpperCase();
  return `${primerNombre} ${inicialApellido}.`;
}

async function consultarTracking(trackingId, donacionRepo, { autenticado = false } = {}) {
  const donacion = await donacionRepo.buscarPorTrackingIdEnriquecida(trackingId);

  if (!donacion) {
    const error = new Error('No se encontró ninguna donación con ese código de seguimiento');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    error.expose = true;
    throw error;
  }

  return {
    ...donacion,
    donorId: undefined,
    donorName: autenticado ? donacion.donorName : ofuscarNombreDonante(donacion.donorName),
    transporterName: autenticado ? donacion.transporterName : ofuscarNombreDonante(donacion.transporterName),
  };
}

module.exports = { consultarTracking };
