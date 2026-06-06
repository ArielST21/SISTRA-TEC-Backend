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
        donor_id, donation_type_id, collection_center_id,
        tracking_id, descripcion, pickup_address,
        estimated_delivery_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const valores = [
      donacion.donorId,
      donacion.donationTypeId,
      donacion.collectionCenterId,
      donacion.trackingId,
      donacion.descripcion,
      donacion.pickupAddress || null,
      donacion.estimatedDeliveryDate || null,
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
    const sql = `
      SELECT d.*,
             dt.nombre AS donation_type_name,
             cc.nombre AS collection_center_name
      FROM donations d
      JOIN donation_types dt ON dt.id = d.donation_type_id
      JOIN collection_centers cc ON cc.id = d.collection_center_id
      WHERE d.donor_id = $1
      ORDER BY d.created_at DESC
    `;
    const { rows } = await ejecutar(sql, [donorId]);
    return rows.map((f) => ({
      ...aEntidad(f),
      donationTypeName: f.donation_type_name,
      collectionCenterName: f.collection_center_name,
    }));
  }

  async listarPorCentro(collectionCenterId, filtros = {}) {
    let sql = 'SELECT * FROM donations WHERE collection_center_id = $1';
    const params = [collectionCenterId];
    if (filtros.status) {
      params.push(filtros.status);
      sql += ` AND status = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await ejecutar(sql, params);
    return rows.map(aEntidad);
  }

  async listarConFiltros(filtros = {}) {
    const whereClauses = ['1=1'];
    const params = [];

    if (filtros.status) {
      params.push(filtros.status);
      whereClauses.push(`d.status = $${params.length}`);
    }
    if (filtros.collectionCenterId) {
      params.push(filtros.collectionCenterId);
      whereClauses.push(`d.collection_center_id = $${params.length}`);
    }
    if (filtros.donationTypeId) {
      params.push(filtros.donationTypeId);
      whereClauses.push(`d.donation_type_id = $${params.length}`);
    }
    if (filtros.trackingId) {
      params.push(`%${filtros.trackingId}%`);
      whereClauses.push(`d.tracking_id ILIKE $${params.length}`);
    }
    if (filtros.donorName) {
      params.push(`%${filtros.donorName}%`);
      whereClauses.push(`u.full_name ILIKE $${params.length}`);
    }
    if (filtros.search) {
      params.push(`%${filtros.search}%`);
      whereClauses.push(`(d.tracking_id ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }

    const where = whereClauses.join(' AND ');

    const baseSql = `
      FROM donations d
      JOIN users u ON u.id = d.donor_id
      JOIN donation_types dt ON dt.id = d.donation_type_id
      JOIN collection_centers cc ON cc.id = d.collection_center_id
      LEFT JOIN donation_assignments da ON da.donation_id = d.id
      WHERE ${where}
    `;

    const { rows: countRows } = await ejecutar(`SELECT COUNT(*) AS total ${baseSql}`, params);
    const total = parseInt(countRows[0].total, 10);

    const pagina = Math.max(1, parseInt(filtros.pagina, 10) || 1);
    const porPagina = Math.min(100, Math.max(1, parseInt(filtros.porPagina, 10) || 50));
    const offset = (pagina - 1) * porPagina;

    params.push(porPagina, offset);
    const dataSql = `
      SELECT d.*,
             u.full_name AS donor_name,
             u.email AS donor_email,
             dt.nombre AS donation_type_name,
             cc.nombre AS collection_center_name,
             (da.id IS NOT NULL) AS is_assigned
      ${baseSql}
      ORDER BY d.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const { rows } = await ejecutar(dataSql, params);
    const items = rows.map((f) => ({
      ...aEntidad(f),
      donorName: f.donor_name,
      donorEmail: f.donor_email,
      donationTypeName: f.donation_type_name,
      collectionCenterName: f.collection_center_name,
      isAssigned: f.is_assigned,
    }));

    return {
      items,
      paginacion: {
        pagina,
        porPagina,
        total,
        totalPaginas: Math.ceil(total / porPagina) || 1,
      },
    };
  }

  async buscarPorIdEnriquecida(id) {
    const sql = `
      SELECT d.*,
             u.full_name AS donor_name,
             u.email AS donor_email,
             dt.nombre AS donation_type_name,
             cc.nombre AS collection_center_name,
             cc.direccion AS collection_center_address
      FROM donations d
      JOIN users u ON u.id = d.donor_id
      JOIN donation_types dt ON dt.id = d.donation_type_id
      JOIN collection_centers cc ON cc.id = d.collection_center_id
      WHERE d.id = $1
      LIMIT 1
    `;
    const { rows } = await ejecutar(sql, [id]);
    if (!rows[0]) return null;
    return {
      ...aEntidad(rows[0]),
      donorName: rows[0].donor_name,
      donorEmail: rows[0].donor_email,
      donationTypeName: rows[0].donation_type_name,
      collectionCenterName: rows[0].collection_center_name,
      collectionCenterAddress: rows[0].collection_center_address,
    };
  }

  async buscarPorTrackingIdEnriquecida(trackingId) {
    const sql = `
      SELECT d.*,
             u.full_name AS donor_name,
             dt.nombre AS donation_type_name,
             cc.nombre AS collection_center_name,
             cc.direccion AS collection_center_address,
             da.transporter_id AS assignment_transporter_id,
             da.vehicle_description AS assignment_vehicle,
             da.destination AS assignment_destination,
             da.assigned_at AS assignment_assigned_at,
             t.full_name AS transporter_name
      FROM donations d
      JOIN users u ON u.id = d.donor_id
      JOIN donation_types dt ON dt.id = d.donation_type_id
      JOIN collection_centers cc ON cc.id = d.collection_center_id
      LEFT JOIN donation_assignments da ON da.donation_id = d.id
      LEFT JOIN users t ON t.id = da.transporter_id
      WHERE d.tracking_id = $1
      LIMIT 1
    `;
    const { rows } = await ejecutar(sql, [trackingId]);
    if (!rows[0]) return null;
    return {
      ...aEntidad(rows[0]),
      donorName: rows[0].donor_name,
      donationTypeName: rows[0].donation_type_name,
      collectionCenterName: rows[0].collection_center_name,
      collectionCenterAddress: rows[0].collection_center_address,
      transporterName: rows[0].transporter_name,
      vehicleDescription: rows[0].assignment_vehicle,
      destination: rows[0].assignment_destination,
      assignedAt: rows[0].assignment_assigned_at,
    };
  }

  async actualizarEstado(id, nuevoEstado) {
    const { rows } = await ejecutar(
      'UPDATE donations SET status = $1 WHERE id = $2 RETURNING *',
      [nuevoEstado, id],
    );
    return aEntidad(rows[0]);
  }

  async marcarEntregada(id) {
    const { rows } = await ejecutar(
      'UPDATE donations SET status = $1, delivered_at = NOW() WHERE id = $2 RETURNING *',
      ['entregado', id],
    );
    return aEntidad(rows[0]);
  }

  async cancelar(id) {
    const { rows } = await ejecutar(
      'DELETE FROM donations WHERE id = $1 RETURNING *',
      [id],
    );
    return aEntidad(rows[0]);
  }

  async obtenerMetricas(collectionCenterId) {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'recibido')    AS recibido,
        COUNT(*) FILTER (WHERE status = 'en_transito') AS en_transito,
        COUNT(*) FILTER (WHERE status = 'entregado')   AS entregado,
        COUNT(*) AS total
      FROM donations
      WHERE collection_center_id = $1
    `;
    const { rows } = await ejecutar(sql, [collectionCenterId]);
    return rows[0];
  }
}

module.exports = DonacionRepositoryPg;
