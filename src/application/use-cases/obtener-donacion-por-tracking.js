/**
 * Caso de uso: Obtener donación pública por tracking ID
 *
 * Permite que cualquier persona (sin autenticación) consulte el estado
 * de una donación ingresando su código de rastreo público.
 *
 * Reglas:
 * - El código de rastreo es público (no requiere autenticación)
 * - Devuelve la donación con datos relacionados (tipo, centro, donante anonimizado)
 * - Si no existe, lanza un error 404
 */
async function obtenerDonacionPorTracking(trackingId, donacionRepository, trackingEventRepository) {
  if (!trackingId || typeof trackingId !== 'string') {
    const error = new Error('Código de rastreo inválido');
    error.statusCode = 400;
    error.codigo = 'TRACKING_ID_INVALIDO';
    throw error;
  }

  const tracking = trackingId.toUpperCase().trim();
  const donacion = await donacionRepository.buscarPorTrackingId(tracking);

  if (!donacion) {
    const error = new Error('Donación no encontrada. Verifica que el código sea correcto.');
    error.statusCode = 404;
    error.codigo = 'DONACION_NO_ENCONTRADA';
    throw error;
  }

  // Obtener eventos de rastreo (bitácora de transiciones de estado)
  const eventos = await trackingEventRepository.obtenerPorDonacion(donacion.id);

  return {
    donacion,
    eventos: eventos || [],
  };
}

module.exports = obtenerDonacionPorTracking;
