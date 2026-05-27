const PasswordResetRepository = require('../../../domain/repositories/password-reset-repository');
const { ejecutar } = require('../connection');

function aEntidad(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    userId: fila.user_id,
    codeHash: fila.code_hash,
    expiresAt: fila.expires_at,
    consumedAt: fila.consumed_at,
    createdAt: fila.created_at,
  };
}

class PasswordResetRepositoryPg extends PasswordResetRepository {
  async crear({ userId, codeHash, expiresAt }) {
    const sql = `
      INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await ejecutar(sql, [userId, codeHash, expiresAt]);
    return aEntidad(rows[0]);
  }

  async buscarVigentePorUsuario(userId) {
    const sql = `
      SELECT * FROM password_reset_codes
      WHERE user_id = $1
        AND consumed_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows } = await ejecutar(sql, [userId]);
    return aEntidad(rows[0]);
  }

  async marcarConsumido(id) {
    await ejecutar(
      'UPDATE password_reset_codes SET consumed_at = NOW() WHERE id = $1',
      [id],
    );
  }

  async invalidarVigentesPorUsuario(userId) {
    await ejecutar(
      `UPDATE password_reset_codes
       SET consumed_at = NOW()
       WHERE user_id = $1 AND consumed_at IS NULL`,
      [userId],
    );
  }
}

module.exports = PasswordResetRepositoryPg;
