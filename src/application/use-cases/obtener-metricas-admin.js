async function obtenerMetricasAdmin(metricasRepo) {
  return metricasRepo.obtenerGlobales();
}

module.exports = { obtenerMetricasAdmin };
