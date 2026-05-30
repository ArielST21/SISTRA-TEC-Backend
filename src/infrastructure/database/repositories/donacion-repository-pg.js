const DonacionRepository = require('../../../domain/repositories/donacion-repository');
const Donacion = require('../../../domain/entities/donacion');
const { ejecutar } = require('../connection');

function aEntidad(fila) {
  if (!fila) return null;
  return new Donacion({
    id: fila.id,
    donorId: fila.donor_id,
    donationTypeId: fila.donation_type_id,
    collectionCenterId: fila.collection_center_id,
    trackingId: fila.tracking_id,
    descripcion: fila.descripcion,
    pickupAddress: fila.pickup_address,
    estimatedDeliveryDate: fila.estimated_delivery_date,
    deliveredAt: fila.delivered_at,
    status: fila.status,
    createdAt: fila.created_at,
  });
}

class DonacionRepositoryPg extends DonacionRepository {
  async crear(donacion) {
    const sql = `
      INSERT INTO donations (
        donor_id, donation_type_id, collection_center_id, tracking_id,
        descripcion, pickup_address, estimated_delivery_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const valores = [
      donacion.donorId,
      donacion.donationTypeId,
      donacion.collectionCenterId,
      donacion.trackingId,
      donacion.descripcion,
      donacion.pickupAddress,
      donacion.estimatedDeliveryDate,
      donacion.status,
    ];
    const { rows } = await ejecutar(sql, valores);
    return aEntidad(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await ejecutar('SELECT * FROM donations WHERE id = $1 LIMIT 1', [id]);
    return aEntidad(rows[0]);
  }

  async buscarPorTrackingId(trackingId) {
    const { rows } = await ejecutar(
      'SELECT * FROM donations WHERE tracking_id = $1 LIMIT 1',
      [trackingId],
    );
    return aEntidad(rows[0]);
  }

  async listarPorDonante(donorId) {
    const { rows } = await ejecutar(
      'SELECT * FROM donations WHERE donor_id = $1 ORDER BY created_at DESC',
      [donorId],
    );
    return rows.map(aEntidad);
  }

  async listarPorCentro(collectionCenterId, filtros = {}) {
    let sql = 'SELECT * FROM donations WHERE collection_center_id = $1';
    const params = [collectionCenterId];

    if (filtros.status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(filtros.status);
    }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await ejecutar(sql, params);
    return rows.map(aEntidad);
  }

  async listarPorTransportista(transporterId) {
    const sql = `
      SELECT d.* FROM donations d
      INNER JOIN donation_assignments da ON d.id = da.donation_id
      WHERE da.transporter_id = $1
      ORDER BY d.created_at DESC
    `;
    const { rows } = await ejecutar(sql, [transporterId]);
    return rows.map(aEntidad);
  }

  async actualizarEstado(id, nuevoEstado, usuarioId) {
    const { rows } = await ejecutar(
      `UPDATE donations SET status = $1 WHERE id = $2 RETURNING *`,
      [nuevoEstado, id],
    );
    return aEntidad(rows[0]);
  }

  async marcarEntregada(id, usuarioId) {
    const { rows } = await ejecutar(
      `UPDATE donations SET status = $1, delivered_at = NOW() WHERE id = $2 RETURNING *`,
      ['entregado', id],
    );
    return aEntidad(rows[0]);
  }

  async cancelar(id) {
    const { rows } = await ejecutar(
      'UPDATE donations SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelado', id],
    );
    return aEntidad(rows[0]);
  }

  async obtenerMetricas(collectionCenterId) {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'recibido') as recibidas,
        COUNT(*) FILTER (WHERE status = 'clasificado') as clasificadas,
        COUNT(*) FILTER (WHERE status = 'en_transito') as en_transito,
        COUNT(*) FILTER (WHERE status = 'entregado') as entregadas
      FROM donations
      WHERE collection_center_id = $1
    `;
    const { rows } = await ejecutar(sql, [collectionCenterId]);
    return rows[0];
  }
}

module.exports = DonacionRepositoryPg;
