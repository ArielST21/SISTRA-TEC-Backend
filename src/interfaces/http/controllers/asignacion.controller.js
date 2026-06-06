const { listarMisAsignaciones } = require('../../../application/use-cases/listar-mis-asignaciones');
const AsignacionRepositoryPg = require('../../../infrastructure/database/repositories/asignacion-repository-pg');
const { exito } = require('../utils/respuesta');

const asignacionRepo = new AsignacionRepositoryPg();

async function getMisAsignaciones(req, res, next) {
  try {
    const asignaciones = await listarMisAsignaciones(req.usuario.id, asignacionRepo);
    return res.status(200).json(exito(asignaciones, 'Asignaciones obtenidas exitosamente'));
  } catch (err) { return next(err); }
}

module.exports = { getMisAsignaciones };
