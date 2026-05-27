const UsuarioRepository = require('../../../domain/repositories/usuario-repository');
const Usuario = require('../../../domain/entities/usuario');
const { ejecutar } = require('../connection');

function aEntidad(fila) {
  if (!fila) return null;
  return new Usuario({
    id: fila.id,
    fullName: fila.full_name,
    email: fila.email,
    passwordHash: fila.password_hash,
    role: fila.role,
    address: fila.address,
    phone: fila.phone,
    vehicle: fila.vehicle,
    collectionCenterId: fila.collection_center_id,
    isActive: fila.is_active,
    createdAt: fila.created_at,
  });
}

class UsuarioRepositoryPg extends UsuarioRepository {
  async buscarPorId(id) {
    const { rows } = await ejecutar('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return aEntidad(rows[0]);
  }

  async buscarPorEmail(email) {
    const { rows } = await ejecutar(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );
    return aEntidad(rows[0]);
  }

  async crear(usuario) {
    const sql = `
      INSERT INTO users (
        full_name, email, password_hash, role, address,
        phone, vehicle, collection_center_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const valores = [
      usuario.fullName,
      usuario.email,
      usuario.passwordHash,
      usuario.role,
      usuario.address,
      usuario.phone,
      usuario.vehicle,
      usuario.collectionCenterId,
      usuario.isActive,
    ];
    try {
      const { rows } = await ejecutar(sql, valores);
      return aEntidad(rows[0]);
    } catch (err) {
      // Violación de UNIQUE en Postgres
      if (err.code === '23505') {
        const esEmail = err.constraint && err.constraint.includes('email');
        const error = new Error(
          esEmail
            ? 'Ya existe una cuenta con ese correo electrónico'
            : 'Ya existe una cuenta con ese número de teléfono',
        );
        error.statusCode = 409;
        error.codigo = esEmail ? 'EMAIL_DUPLICADO' : 'TELEFONO_DUPLICADO';
        error.expose = true;
        throw error;
      }
      throw err;
    }
  }

  async listarPorRol(rol) {
    const { rows } = await ejecutar(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
      [rol],
    );
    return rows.map(aEntidad);
  }

  async listarTodos(filtros = {}) {
    let sql = `
      SELECT u.*, cc.nombre AS collection_center_name
      FROM users u
      LEFT JOIN collection_centers cc ON cc.id = u.collection_center_id
      WHERE 1=1
    `;
    const params = [];
    if (filtros.role) {
      params.push(filtros.role);
      sql += ` AND u.role = $${params.length}`;
    }
    if (filtros.isActive !== undefined) {
      params.push(filtros.isActive);
      sql += ` AND u.is_active = $${params.length}`;
    }
    sql += ' ORDER BY u.created_at DESC';
    const { rows } = await ejecutar(sql, params);
    return rows.map((f) => {
      const entidad = aEntidad(f);
      entidad.collectionCenterName = f.collection_center_name || null;
      return entidad;
    });
  }

  async actualizarEstadoActivo(id, activo) {
    const { rows } = await ejecutar(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [activo, id],
    );
    return aEntidad(rows[0]);
  }

  async actualizarPerfil(id, cambios) {
    const campos = [];
    const valores = [];
    const mapa = {
      fullName: 'full_name',
      email: 'email',
      address: 'address',
      phone: 'phone',
      vehicle: 'vehicle',
      collectionCenterId: 'collection_center_id',
    };
    for (const [clave, columna] of Object.entries(mapa)) {
      if (cambios[clave] !== undefined) {
        valores.push(cambios[clave]);
        campos.push(`${columna} = $${valores.length}`);
      }
    }
    if (campos.length === 0) return this.buscarPorId(id);
    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = $${valores.length} RETURNING *`;
    try {
      const { rows } = await ejecutar(sql, valores);
      return aEntidad(rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        const esEmail = err.constraint && err.constraint.includes('email');
        const error = new Error(
          esEmail
            ? 'Ya existe una cuenta con ese correo electrónico'
            : 'Ya existe una cuenta con ese número de teléfono',
        );
        error.statusCode = 409;
        error.codigo = esEmail ? 'EMAIL_DUPLICADO' : 'TELEFONO_DUPLICADO';
        error.expose = true;
        throw error;
      }
      throw err;
    }
  }

  async actualizarPassword(id, nuevoHash) {
    const { rows } = await ejecutar(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
      [nuevoHash, id],
    );
    return aEntidad(rows[0]);
  }
}

module.exports = UsuarioRepositoryPg;
