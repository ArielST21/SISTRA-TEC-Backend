const { registrarDonacion } = require('../../../application/use-cases/registrar-donacion');
const { listarMisDonaciones } = require('../../../application/use-cases/listar-mis-donaciones');
const { obtenerDonacion } = require('../../../application/use-cases/obtener-donacion');
const { consultarTracking } = require('../../../application/use-cases/consultar-tracking');
const { listarDonaciones } = require('../../../application/use-cases/listar-donaciones');
const { cambiarEstadoDonacion } = require('../../../application/use-cases/cambiar-estado-donacion');
const { asignarTransportista } = require('../../../application/use-cases/asignar-transportista');
const { cancelarDonacion } = require('../../../application/use-cases/cancelar-donacion');
const { obtenerTrackingDonacion } = require('../../../application/use-cases/obtener-tracking-donacion');
const { ESTADOS_DONACION } = require('../../../domain/entities/estado-donacion');

const DonacionRepositoryPg = require('../../../infrastructure/database/repositories/donacion-repository-pg');
const TipoDonacionRepositoryPg = require('../../../infrastructure/database/repositories/tipo-donacion-repository-pg');
const CentroAcopioRepositoryPg = require('../../../infrastructure/database/repositories/centro-acopio-repository-pg');
const TrackingEventRepositoryPg = require('../../../infrastructure/database/repositories/tracking-event-repository-pg');
const AsignacionRepositoryPg = require('../../../infrastructure/database/repositories/asignacion-repository-pg');
const UsuarioRepositoryPg = require('../../../infrastructure/database/repositories/usuario-repository-pg');
const { exito } = require('../utils/respuesta');

const donacionRepo = new DonacionRepositoryPg();
const tipoDonacionRepo = new TipoDonacionRepositoryPg();
const centroAcopioRepo = new CentroAcopioRepositoryPg();
const trackingEventRepo = new TrackingEventRepositoryPg();
const asignacionRepo = new AsignacionRepositoryPg();
const usuarioRepo = new UsuarioRepositoryPg();

async function createDonacion(req, res, next) {
  try {
    const { donationTypeId, collectionCenterId, descripcion, pickupAddress, estimatedDeliveryDate } = req.body;
    const donorId = req.usuario.id;
    const donacion = await registrarDonacion(
      { donationTypeId, collectionCenterId, descripcion, pickupAddress, estimatedDeliveryDate },
      donorId,
      { donacionRepo, tipoDonacionRepo, centroAcopioRepo, trackingEventRepo },
    );
    return res.status(201).json(exito(donacion, 'Donación registrada exitosamente'));
  } catch (err) {
    return next(err);
  }
}

async function getMisDonaciones(req, res, next) {
  try {
    const donaciones = await listarMisDonaciones(req.usuario.id, donacionRepo);
    return res.status(200).json(exito(donaciones, 'Donaciones obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

async function getDonacion(req, res, next) {
  try {
    const donacion = await obtenerDonacion(req.params.id, req.usuario.id, donacionRepo);
    return res.status(200).json(exito(donacion, 'Donación obtenida exitosamente'));
  } catch (err) { return next(err); }
}

async function trackDonacion(req, res, next) {
  try {
    const donacion = await consultarTracking(req.params.trackingId, donacionRepo);
    return res.status(200).json(exito(donacion, 'Donación encontrada'));
  } catch (err) { return next(err); }
}

async function getAllDonaciones(req, res, next) {
  try {
    const filtros = {
      status: req.query.status,
      collectionCenterId: req.query.collectionCenterId ? Number(req.query.collectionCenterId) : undefined,
      donationTypeId: req.query.donationTypeId ? Number(req.query.donationTypeId) : undefined,
      trackingId: req.query.trackingId,
      donorName: req.query.donorName,
    };
    const donaciones = await listarDonaciones(filtros, donacionRepo);
    return res.status(200).json(exito(donaciones, 'Donaciones obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

async function classifyDonacion(req, res, next) {
  try {
    const donacion = await cambiarEstadoDonacion(
      {
        donacionId: req.params.id,
        nuevoEstado: ESTADOS_DONACION.CLASIFICADO,
        usuarioId: req.usuario.id,
      },
      { donacionRepo, trackingEventRepo },
    );
    return res.status(200).json(exito(donacion, 'Donación clasificada exitosamente'));
  } catch (err) { return next(err); }
}

async function transitDonacion(req, res, next) {
  try {
    const donacion = await cambiarEstadoDonacion(
      {
        donacionId: req.params.id,
        nuevoEstado: ESTADOS_DONACION.EN_TRANSITO,
        usuarioId: req.usuario.id,
        validarPropiedad: async (don) => {
          const asignacion = await asignacionRepo.buscarPorDonacion(don.id);
          if (!asignacion || asignacion.transporterId !== req.usuario.id) {
            const error = new Error('No tiene una asignación para esta donación');
            error.statusCode = 403;
            error.codigo = 'NO_ASIGNADO';
            error.expose = true;
            throw error;
          }
        },
      },
      { donacionRepo, trackingEventRepo },
    );
    return res.status(200).json(exito(donacion, 'Donación marcada como en tránsito'));
  } catch (err) { return next(err); }
}

async function deliverDonacion(req, res, next) {
  try {
    const donacion = await cambiarEstadoDonacion(
      {
        donacionId: req.params.id,
        nuevoEstado: ESTADOS_DONACION.ENTREGADO,
        usuarioId: req.usuario.id,
        validarPropiedad: async (don) => {
          if (req.usuario.role === 'admin') return;
          const asignacion = await asignacionRepo.buscarPorDonacion(don.id);
          if (!asignacion || asignacion.transporterId !== req.usuario.id) {
            const error = new Error('No tiene una asignación para esta donación');
            error.statusCode = 403;
            error.codigo = 'NO_ASIGNADO';
            error.expose = true;
            throw error;
          }
        },
      },
      { donacionRepo, trackingEventRepo },
    );
    return res.status(200).json(exito(donacion, 'Donación marcada como entregada'));
  } catch (err) { return next(err); }
}

async function assignTransportista(req, res, next) {
  try {
    const { transporterId, destination } = req.body;
    const asignacion = await asignarTransportista(
      { donacionId: req.params.id, transporterId, destination },
      { donacionRepo, usuarioRepo, asignacionRepo },
    );
    return res.status(201).json(exito(asignacion, 'Transportista asignado exitosamente'));
  } catch (err) { return next(err); }
}

async function deleteDonacion(req, res, next) {
  try {
    await cancelarDonacion(req.params.id, req.usuario.id, donacionRepo);
    return res.status(200).json(exito(null, 'Donación cancelada exitosamente'));
  } catch (err) { return next(err); }
}

async function getDonacionTracking(req, res, next) {
  try {
    const eventos = await obtenerTrackingDonacion(req.params.id, { donacionRepo, trackingEventRepo });
    return res.status(200).json(exito(eventos, 'Bitácora de eventos obtenida'));
  } catch (err) { return next(err); }
}

module.exports = {
  createDonacion,
  getMisDonaciones,
  getDonacion,
  trackDonacion,
  getAllDonaciones,
  classifyDonacion,
  transitDonacion,
  deliverDonacion,
  assignTransportista,
  deleteDonacion,
  getDonacionTracking,
};
