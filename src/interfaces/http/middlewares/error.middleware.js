const env = require('../../../config/env');
const { fallo } = require('../utils/respuesta');

function rutaNoEncontrada(req, res) {
  return res.status(404).json(
    fallo(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 'RUTA_NO_ENCONTRADA'),
  );
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, _next) {
  console.error('[ERROR]', err.message);
  if (env.esDesarrollo) console.error(err.stack);

  const status = err.statusCode || err.status || 500;
  const esErrorDeNegocio = err.expose === true;
  const mensaje = esErrorDeNegocio || env.esDesarrollo
    ? err.message || 'Error interno del servidor'
    : 'Error interno del servidor';
  const codigo = err.codigo || (status >= 500 ? 'ERROR_INTERNO' : 'ERROR_SOLICITUD');
  const detalle = env.esDesarrollo && !esErrorDeNegocio ? err.stack : null;

  return res.status(status).json(fallo(mensaje, codigo, detalle));
}

module.exports = { rutaNoEncontrada, manejadorErrores };
