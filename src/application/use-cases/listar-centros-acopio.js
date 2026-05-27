async function listarCentrosAcopio(centroAcopioRepo) {
  return centroAcopioRepo.listarTodos();
}

module.exports = { listarCentrosAcopio };
