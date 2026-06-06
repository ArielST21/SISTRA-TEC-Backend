async function listarTiposDonacion(tipoDonacionRepo) {
  return tipoDonacionRepo.listarTodos();
}

module.exports = { listarTiposDonacion };
