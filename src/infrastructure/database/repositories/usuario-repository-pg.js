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

  async actualizarEstadoActivo(id, activo) {
    const { rows } = await ejecutar(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [activo, id],
    );
    return aEntidad(rows[0]);
  }
}

module.exports = UsuarioRepositoryPg;
