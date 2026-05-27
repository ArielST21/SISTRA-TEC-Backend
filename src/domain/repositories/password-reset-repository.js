/* eslint-disable no-unused-vars */
class PasswordResetRepository {
  async crear({ userId, codeHash, expiresAt }) { throw new Error('No implementado'); }
  async buscarVigentePorUsuario(userId) { throw new Error('No implementado'); }
  async marcarConsumido(id) { throw new Error('No implementado'); }
  async invalidarVigentesPorUsuario(userId) { throw new Error('No implementado'); }
}

module.exports = PasswordResetRepository;
