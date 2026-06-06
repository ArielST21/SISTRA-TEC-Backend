const AsignacionRepository = require('../../../domain/repositories/asignacion-repository');
const { ejecutar } = require('../connection');

function aEntidad(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    donationId: fila.donation_id,
    transporterId: fila.transporter_id,
    vehicleDescription: fila.vehicle_description,
    destination: fila.destination,
    assignedAt: fila.assigned_at,
  };
}

class AsignacionRepositoryPg extends AsignacionRepository {
  async crear({ donationId, transporterId, vehicleDescription, destination }) {
    const sql = `
      INSERT INTO donation_assignments
        (donation_id, transporter_id, vehicle_description, destination)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await ejecutar(sql, [donationId, transporterId, vehicleDescription, destination]);
    return aEntidad(rows[0]);
  }

  async buscarPorDonacion(donationId) {
    const { rows } = await ejecutar(
      'SELECT * FROM donation_assignments WHERE donation_id = $1 LIMIT 1',
      [donationId],
    );
    return aEntidad(rows[0]);
  }

  async listarPorTransportista(transporterId) {
    const sql = `
      SELECT da.*,
             d.id AS donation_id, d.tracking_id, d.status, d.descripcion,
             d.estimated_delivery_date, d.pickup_address,
             d.collection_center_id, cc.nombre AS collection_center_name,
             d.donation_type_id, dt.nombre AS donation_type_name,
             u.full_name AS donor_name
      FROM donation_assignments da
      JOIN donations d ON d.id = da.donation_id
      JOIN donation_types dt ON dt.id = d.donation_type_id
      JOIN collection_centers cc ON cc.id = d.collection_center_id
      JOIN users u ON u.id = d.donor_id
      WHERE da.transporter_id = $1
      ORDER BY da.assigned_at DESC
    `;
    const { rows } = await ejecutar(sql, [transporterId]);
    return rows.map((f) => ({
      ...aEntidad(f),
      donacion: {
        id: f.donation_id,
        trackingId: f.tracking_id,
        status: f.status,
        descripcion: f.descripcion,
        estimatedDeliveryDate: f.estimated_delivery_date,
        pickupAddress: f.pickup_address,
        donationTypeId: f.donation_type_id,
        donationTypeName: f.donation_type_name,
        collectionCenterId: f.collection_center_id,
        collectionCenterName: f.collection_center_name,
        donorName: f.donor_name,
      },
    }));
  }
}

module.exports = AsignacionRepositoryPg;
