async function obtenerMetricasTransportista(transporterId, metricasRepo) {
  return metricasRepo.obtenerPorTransportista(transporterId);
}

module.exports = { obtenerMetricasTransportista };
