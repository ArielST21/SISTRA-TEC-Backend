async function cambiarEstadoActivo(usuarioId, activo, usuarioRepo) {
  const existente = await usuarioRepo.buscarPorId(usuarioId);
  if (!existente) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    error.codigo = 'USUARIO_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  const actualizado = await usuarioRepo.actualizarEstadoActivo(usuarioId, activo);
  return actualizado.aJson();
}

module.exports = { cambiarEstadoActivo };
