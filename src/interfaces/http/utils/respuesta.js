function exito(datos = null, mensaje = 'OK') {
  return {
    exito: true,
    mensaje,
    datos,
    error: null,
  };
}

function fallo(mensaje, codigo = 'ERROR_INTERNO', detalle = null) {
  return {
    exito: false,
    mensaje,
    datos: null,
    error: { codigo, detalle },
  };
}

module.exports = { exito, fallo };
