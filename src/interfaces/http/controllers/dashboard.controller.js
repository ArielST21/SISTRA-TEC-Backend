const { obtenerMetricasAdmin } = require('../../../application/use-cases/obtener-metricas-admin');
const { obtenerMetricasTransportista } = require('../../../application/use-cases/obtener-metricas-transportista');
const MetricasRepositoryPg = require('../../../infrastructure/database/repositories/metricas-repository-pg');
const { exito } = require('../utils/respuesta');

const metricasRepo = new MetricasRepositoryPg();

async function getAdminMetrics(req, res, next) {
  try {
    const metricas = await obtenerMetricasAdmin(metricasRepo);
    return res.status(200).json(exito(metricas, 'Métricas obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

async function getMyMetrics(req, res, next) {
  try {
    const metricas = await obtenerMetricasTransportista(req.usuario.id, metricasRepo);
    return res.status(200).json(exito(metricas, 'Métricas obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

module.exports = { getAdminMetrics, getMyMetrics };
