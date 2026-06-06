const Donacion = require('../../domain/entities/donacion');
const { ESTADOS_DONACION } = require('../../domain/entities/estado-donacion');
const { generarTrackingId } = require('../../domain/services/generador-tracking-id');

async function registrarDonacion(
  { donationTypeId, collectionCenterId, descripcion, pickupAddress, estimatedDeliveryDate },
  donorId,
  { donacionRepo, tipoDonacionRepo, centroAcopioRepo, trackingEventRepo },
) {
  const tipoDonacion = await tipoDonacionRepo.buscarPorId(donationTypeId);
  if (!tipoDonacion) {
    const error = new Error('El tipo de donación no existe');
    error.statusCode = 404;
    error.codigo = 'TIPO_DONACION_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  const centro = await centroAcopioRepo.buscarPorId(collectionCenterId);
  if (!centro) {
    const error = new Error('El centro de acopio no existe');
    error.statusCode = 404;
    error.codigo = 'CENTRO_ACOPIO_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  const trackingId = generarTrackingId();

  const donacion = new Donacion({
    donorId,
    donationTypeId,
    collectionCenterId,
    trackingId,
    descripcion,
    pickupAddress: pickupAddress || null,
    estimatedDeliveryDate: estimatedDeliveryDate || null,
    status: ESTADOS_DONACION.RECIBIDO,
  });

  const donacionGuardada = await donacionRepo.crear(donacion);

  if (trackingEventRepo) {
    await trackingEventRepo.registrar({
      donationId: donacionGuardada.id,
      changedBy: donorId,
      fromStatus: null,
      toStatus: ESTADOS_DONACION.RECIBIDO,
    });
  }

  return {
    ...donacionGuardada,
    donationTypeName: tipoDonacion.nombre,
    collectionCenterName: centro.nombre,
  };
}

module.exports = { registrarDonacion };
