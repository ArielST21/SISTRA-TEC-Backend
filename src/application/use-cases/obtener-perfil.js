async function obtenerPerfil(usuarioId, usuarioRepo) {
  const usuario = await usuarioRepo.buscarPorId(usuarioId);
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    error.codigo = 'USUARIO_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }
  return usuario.aJson();
}

module.exports = { obtenerPerfil };
