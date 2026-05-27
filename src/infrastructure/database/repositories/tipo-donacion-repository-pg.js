const TipoDonacionRepository = require('../../../domain/repositories/tipo-donacion-repository');
const { ejecutar } = require('../connection');

class TipoDonacionRepositoryPg extends TipoDonacionRepository {
  async listarTodos() {
    const { rows } = await ejecutar('SELECT id, nombre FROM donation_types ORDER BY nombre ASC');
    return rows.map((f) => ({ id: f.id, nombre: f.nombre }));
  }

  async buscarPorId(id) {
    const { rows } = await ejecutar('SELECT id, nombre FROM donation_types WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ? { id: rows[0].id, nombre: rows[0].nombre } : null;
  }
}

module.exports = TipoDonacionRepositoryPg;
