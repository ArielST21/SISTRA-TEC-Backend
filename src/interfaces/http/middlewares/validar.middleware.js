const { validationResult } = require('express-validator');
const { fallo } = require('../utils/respuesta');

function validar(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();

  const detalle = errores.array().map((e) => ({
    campo: e.path,
    mensaje: e.msg,
  }));

  return res.status(400).json(
    fallo('Datos de entrada inválidos', 'VALIDACION_FALLIDA', detalle),
  );
}

module.exports = { validar };
