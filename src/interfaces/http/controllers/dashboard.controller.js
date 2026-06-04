const { obtenerMetricasAdmin } = require('../../../application/use-cases/obtener-metricas-admin');
const { obtenerMetricasTransportista } = require('../../../application/use-cases/obtener-metricas-transportista');
const MetricasRepositoryPg = require('../../../infrastructure/database/repositories/metricas-repository-pg');
const { exito } = require('../utils/respuesta');

const metricasRepo = new MetricasRepositoryPg();

async function getAdminMetrics(req, res, next) {
  try {
    const raw = await obtenerMetricasAdmin(metricasRepo);
    const respuesta = {
      total: raw.total,
      recibidos: raw.porEstado.recibido,
      enTransito: raw.porEstado.enTransito,
      entregados: raw.porEstado.entregado,
      detalle: {
        recibido: raw.porEstado.recibido,
        en_transito: raw.porEstado.enTransito,
        entregado: raw.porEstado.entregado,
      },
      distribucion: [
        { estado: 'Recibido', valor: raw.porEstado.recibido },
        { estado: 'En Tránsito', valor: raw.porEstado.enTransito },
        { estado: 'Entregado', valor: raw.porEstado.entregado },
      ],
    };
    return res.status(200).json(exito(respuesta, 'Métricas obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

async function getMyMetrics(req, res, next) {
  try {
    const raw = await obtenerMetricasTransportista(req.usuario.id, metricasRepo);
    const pendientes = raw.totalAsignadas - raw.enTransito - raw.entregado;
    const respuesta = {
      pendientes: Math.max(0, pendientes),
      enTransito: raw.enTransito,
      entregados: raw.entregado,
    };
    return res.status(200).json(exito(respuesta, 'Métricas obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

module.exports = { getAdminMetrics, getMyMetrics };
