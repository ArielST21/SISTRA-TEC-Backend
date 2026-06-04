const MetricasRepository = require('../../../domain/repositories/metricas-repository');
const { ejecutar } = require('../connection');

class MetricasRepositoryPg extends MetricasRepository {
  async obtenerGlobales() {
    const sqlTotales = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'recibido')    AS recibido,
        COUNT(*) FILTER (WHERE status = 'en_transito') AS en_transito,
        COUNT(*) FILTER (WHERE status = 'entregado')   AS entregado,
        COUNT(*) AS total
      FROM donations
    `;
    const sqlPorTipo = `
      SELECT dt.nombre AS tipo, COUNT(d.id)::int AS cantidad
      FROM donation_types dt
      LEFT JOIN donations d ON d.donation_type_id = dt.id
      GROUP BY dt.nombre
      ORDER BY cantidad DESC
    `;
    const sqlPorCentro = `
      SELECT cc.nombre AS centro, COUNT(d.id)::int AS cantidad
      FROM collection_centers cc
      LEFT JOIN donations d ON d.collection_center_id = cc.id
      GROUP BY cc.nombre
      ORDER BY cantidad DESC
    `;

    const [totales, porTipo, porCentro] = await Promise.all([
      ejecutar(sqlTotales),
      ejecutar(sqlPorTipo),
      ejecutar(sqlPorCentro),
    ]);

    const t = totales.rows[0];
    return {
      porEstado: {
        recibido: Number(t.recibido),
        enTransito: Number(t.en_transito),
        entregado: Number(t.entregado),
      },
      total: Number(t.total),
      porTipo: porTipo.rows,
      porCentro: porCentro.rows,
    };
  }

  async obtenerPorTransportista(transporterId) {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE d.status = 'en_transito') AS en_transito,
        COUNT(*) FILTER (WHERE d.status = 'entregado')   AS entregado,
        COUNT(*) AS total_asignadas
      FROM donation_assignments da
      JOIN donations d ON d.id = da.donation_id
      WHERE da.transporter_id = $1
    `;
    const { rows } = await ejecutar(sql, [transporterId]);
    const r = rows[0];
    return {
      enTransito: Number(r.en_transito),
      entregado: Number(r.entregado),
      totalAsignadas: Number(r.total_asignadas),
    };
  }
}

module.exports = MetricasRepositoryPg;
