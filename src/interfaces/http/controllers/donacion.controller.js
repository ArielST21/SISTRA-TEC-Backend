const obtenerDonacionPorTracking = require('../../../application/use-cases/obtener-donacion-por-tracking');
const DonacionRepositoryPg = require('../../../infrastructure/database/repositories/donacion-repository-pg');
const TrackingEventRepositoryPg = require('../../../infrastructure/database/repositories/tracking-event-repository-pg');
const { exito, fallo } = require('../utils/respuesta');
const env = require('../../../config/env');

const donacionRepository = new DonacionRepositoryPg();
const trackingEventRepository = new TrackingEventRepositoryPg();

/**
 * Controlador: Rastrear donación por código público (HU-02)
 *
 * Endpoint público que permite consultar el estado de una donación
 * sin necesidad de autenticación. Devuelve toda la información necesaria
 * para mostrar la trazabilidad en tiempo real en el frontend.
 *
 * Reglas:
 * - No requiere autenticación
 * - El trackingId es case-insensitive y se normaliza a mayúsculas
 * - Devuelve 404 si la donación no existe
 * - Incluye la bitácora completa de cambios de estado
 */
async function rastrear(req, res) {
  try {
    const { trackingId } = req.params;

    const { donacion, eventos } = await obtenerDonacionPorTracking(
      trackingId,
      donacionRepository,
      trackingEventRepository,
    );

    // Mapear respuesta al formato esperado por el frontend
    // Incluir solo los campos públicos (no exponer IDs internos ni datos sensibles)
    const respuesta = {
      codigo: donacion.trackingId,
      estado: donacion.status,
      descripcion: donacion.descripcion,
      fechaRegistro: donacion.createdAt,
      fechaEstimadaEntrega: donacion.estimatedDeliveryDate,
      fechaEntregado: donacion.deliveredAt,
      eventos: eventos.map((evt) => ({
        estado: evt.toStatus,
        estadoAnterior: evt.fromStatus,
        fecha: evt.createdAt,
      })),
    };

    return res.status(200).json(
      exito(respuesta, 'Donación encontrada exitosamente'),
    );
  } catch (err) {
    // Errores validados: tienen statusCode y codigo definidos
    if (err.expose || err.statusCode) {
      const statusCode = err.statusCode || 400;
      const detalle = env.esProduccion ? null : err.message;

      return res.status(statusCode).json(
        fallo(
          err.message,
          err.codigo || 'ERROR_CONSULTA',
          detalle,
        ),
      );
    }

    // Error inesperado: no exponer detalles en producción
    console.error('[ERROR] rastrear:', err.message);

    return res.status(500).json(
      fallo(
        'Error al consultar la donación',
        'ERROR_INTERNO',
        env.esProduccion ? null : err.message,
      ),
    );
  }
}

module.exports = { rastrear };
