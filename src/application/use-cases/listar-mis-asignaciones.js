async function listarMisAsignaciones(transporterId, asignacionRepo) {
  return asignacionRepo.listarPorTransportista(transporterId);
}

module.exports = { listarMisAsignaciones };
