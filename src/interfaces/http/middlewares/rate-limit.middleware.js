const rateLimit = require('express-rate-limit');
const { fallo } = require('../utils/respuesta');

const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: fallo(
    'Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.',
    'RATE_LIMIT_AUTH',
  ),
});

const limitadorGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: fallo(
    'Demasiadas solicitudes. Intente de nuevo más tarde.',
    'RATE_LIMIT_GLOBAL',
  ),
});

module.exports = { limitadorAuth, limitadorGlobal };
