async function listarDonaciones(filtros, donacionRepo) {
  return donacionRepo.listarConFiltros(filtros);
}

module.exports = { listarDonaciones };
