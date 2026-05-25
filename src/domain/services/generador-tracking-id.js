const crypto = require('crypto');

const CARACTERES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generarSufijoAleatorio(longitud = 4) {
  let resultado = '';
  const bytes = crypto.randomBytes(longitud);
  for (let i = 0; i < longitud; i += 1) {
    resultado += CARACTERES[bytes[i] % CARACTERES.length];
  }
  return resultado;
}

function generarTrackingId(anio = new Date().getFullYear()) {
  return `DON-${anio}-${generarSufijoAleatorio(4)}`;
}

module.exports = { generarTrackingId };
