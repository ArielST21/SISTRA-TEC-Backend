const TrackingEventRepository = require('../../../domain/repositories/tracking-event-repository');
const { ejecutar } = require('../connection');

function aEntidad(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    donationId: fila.donation_id,
    changedBy: fila.changed_by,
    fromStatus: fila.from_status,
    toStatus: fila.to_status,
    createdAt: fila.created_at,
  };
}

class TrackingEventRepositoryPg extends TrackingEventRepository {
  async registrar({ donationId, changedBy, fromStatus, toStatus }) {
    const sql = `
      INSERT INTO tracking_events (donation_id, changed_by, from_status, to_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await ejecutar(sql, [donationId, changedBy, fromStatus, toStatus]);
    return aEntidad(rows[0]);
  }

  async listarPorDonacion(donationId) {
    const sql = `
      SELECT te.*,
             u.full_name AS changed_by_name,
             u.role AS changed_by_role
      FROM tracking_events te
      LEFT JOIN users u ON u.id = te.changed_by
      WHERE te.donation_id = $1
      ORDER BY te.created_at ASC
    `;
    const { rows } = await ejecutar(sql, [donationId]);
    return rows.map((f) => ({
      ...aEntidad(f),
      changedByName: f.changed_by_name,
      changedByRole: f.changed_by_role,
    }));
  }
}

module.exports = TrackingEventRepositoryPg;
