const CentroAcopioRepository = require('../../../domain/repositories/centro-acopio-repository');
const { ejecutar } = require('../connection');

class CentroAcopioRepositoryPg extends CentroAcopioRepository {
  async listarTodos() {
    const { rows } = await ejecutar('SELECT id, nombre, direccion FROM collection_centers ORDER BY nombre ASC');
    return rows.map((f) => ({ id: f.id, nombre: f.nombre, direccion: f.direccion }));
  }

  async buscarPorId(id) {
    const { rows } = await ejecutar('SELECT id, nombre, direccion FROM collection_centers WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ? { id: rows[0].id, nombre: rows[0].nombre, direccion: rows[0].direccion } : null;
  }
}

module.exports = CentroAcopioRepositoryPg;
