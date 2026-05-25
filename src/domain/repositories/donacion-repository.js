/* eslint-disable no-unused-vars */
class DonacionRepository {
  async crear(donacion) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async buscarPorTrackingId(trackingId) { throw new Error('No implementado'); }
  async listarPorDonante(donorId) { throw new Error('No implementado'); }
  async listarPorCentro(collectionCenterId, filtros = {}) { throw new Error('No implementado'); }
  async listarPorTransportista(transporterId) { throw new Error('No implementado'); }
  async actualizarEstado(id, nuevoEstado, usuarioId) { throw new Error('No implementado'); }
  async marcarEntregada(id, usuarioId) { throw new Error('No implementado'); }
  async cancelar(id) { throw new Error('No implementado'); }
  async obtenerMetricas(collectionCenterId) { throw new Error('No implementado'); }
}

module.exports = DonacionRepository;
