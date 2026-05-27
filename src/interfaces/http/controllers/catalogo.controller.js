const { listarTiposDonacion } = require('../../../application/use-cases/listar-tipos-donacion');
const { listarCentrosAcopio } = require('../../../application/use-cases/listar-centros-acopio');
const TipoDonacionRepositoryPg = require('../../../infrastructure/database/repositories/tipo-donacion-repository-pg');
const CentroAcopioRepositoryPg = require('../../../infrastructure/database/repositories/centro-acopio-repository-pg');
const { exito } = require('../utils/respuesta');

const tipoDonacionRepo = new TipoDonacionRepositoryPg();
const centroAcopioRepo = new CentroAcopioRepositoryPg();

async function getTiposDonacion(req, res, next) {
  try {
    const tipos = await listarTiposDonacion(tipoDonacionRepo);
    return res.status(200).json(exito(tipos, 'Tipos de donación obtenidos exitosamente'));
  } catch (err) {
    return next(err);
  }
}

async function getCentrosAcopio(req, res, next) {
  try {
    const centros = await listarCentrosAcopio(centroAcopioRepo);
    return res.status(200).json(exito(centros, 'Centros de acopio obtenidos exitosamente'));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTiposDonacion, getCentrosAcopio };
