async function listarMisDonaciones(donorId, donacionRepo) {
  return donacionRepo.listarPorDonante(donorId);
}

module.exports = { listarMisDonaciones };
