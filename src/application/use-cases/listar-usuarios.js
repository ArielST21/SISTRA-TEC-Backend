async function listarUsuarios(filtros, usuarioRepo) {
  const usuarios = await usuarioRepo.listarTodos(filtros);
  return usuarios.map((u) => ({
    ...u.aJson(),
    collectionCenterName: u.collectionCenterName || null,
  }));
}

module.exports = { listarUsuarios };
