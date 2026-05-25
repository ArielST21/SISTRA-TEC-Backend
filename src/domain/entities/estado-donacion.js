const ESTADOS_DONACION = Object.freeze({
  RECIBIDO: 'recibido',
  CLASIFICADO: 'clasificado',
  EN_TRANSITO: 'en_transito',
  ENTREGADO: 'entregado',
});

const ORDEN_ESTADOS = [
  ESTADOS_DONACION.RECIBIDO,
  ESTADOS_DONACION.CLASIFICADO,
  ESTADOS_DONACION.EN_TRANSITO,
  ESTADOS_DONACION.ENTREGADO,
];

function esEstadoValido(estado) {
  return ORDEN_ESTADOS.includes(estado);
}

function esTransicionValida(estadoActual, nuevoEstado) {
  if (!esEstadoValido(estadoActual) || !esEstadoValido(nuevoEstado)) {
    return false;
  }
  const indiceActual = ORDEN_ESTADOS.indexOf(estadoActual);
  const indiceNuevo = ORDEN_ESTADOS.indexOf(nuevoEstado);
  return indiceNuevo === indiceActual + 1;
}

function esEstadoFinal(estado) {
  return estado === ESTADOS_DONACION.ENTREGADO;
}

module.exports = {
  ESTADOS_DONACION,
  ORDEN_ESTADOS,
  esEstadoValido,
  esTransicionValida,
  esEstadoFinal,
};
