const CAMPOS_PERMITIDOS_POR_ROL = {
  donor: ['fullName', 'email', 'address', 'phone'],
  transporter: ['fullName', 'email', 'address', 'phone', 'vehicle', 'collectionCenterId'],
  admin: ['fullName', 'email', 'address', 'phone', 'collectionCenterId'],
};

async function actualizarPerfil(usuarioId, cambios, usuarioRepo) {
  const usuario = await usuarioRepo.buscarPorId(usuarioId);
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    error.codigo = 'USUARIO_NO_ENCONTRADO';
    error.expose = true;
    throw error;
  }

  const permitidos = CAMPOS_PERMITIDOS_POR_ROL[usuario.role] || [];
  const cambiosFiltrados = {};
  for (const campo of permitidos) {
    if (cambios[campo] !== undefined) {
      cambiosFiltrados[campo] = cambios[campo];
    }
  }

  const actualizado = await usuarioRepo.actualizarPerfil(usuarioId, cambiosFiltrados);
  return actualizado.aJson();
}

module.exports = { actualizarPerfil };
