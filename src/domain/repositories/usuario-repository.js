/* eslint-disable no-unused-vars */
class UsuarioRepository {
  async buscarPorId(id) { throw new Error('No implementado'); }
  async buscarPorEmail(email) { throw new Error('No implementado'); }
  async crear(usuario) { throw new Error('No implementado'); }
  async listarPorRol(rol) { throw new Error('No implementado'); }
  async listarTodos(filtros = {}) { throw new Error('No implementado'); }
  async actualizarEstadoActivo(id, activo) { throw new Error('No implementado'); }
  async actualizarPerfil(id, cambios) { throw new Error('No implementado'); }
  async actualizarPassword(id, nuevoHash) { throw new Error('No implementado'); }
}

module.exports = UsuarioRepository;
