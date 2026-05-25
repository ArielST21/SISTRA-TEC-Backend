const {
  ESTADOS_DONACION,
  esEstadoValido,
  esTransicionValida,
  esEstadoFinal,
} = require('../../src/domain/entities/estado-donacion');

describe('estado-donacion', () => {
  describe('esEstadoValido', () => {
    test('reconoce los cuatro estados válidos', () => {
      expect(esEstadoValido(ESTADOS_DONACION.RECIBIDO)).toBe(true);
      expect(esEstadoValido(ESTADOS_DONACION.CLASIFICADO)).toBe(true);
      expect(esEstadoValido(ESTADOS_DONACION.EN_TRANSITO)).toBe(true);
      expect(esEstadoValido(ESTADOS_DONACION.ENTREGADO)).toBe(true);
    });

    test('rechaza estados inexistentes', () => {
      expect(esEstadoValido('inexistente')).toBe(false);
      expect(esEstadoValido(null)).toBe(false);
      expect(esEstadoValido(undefined)).toBe(false);
    });
  });

  describe('esTransicionValida', () => {
    test('permite avanzar un solo paso secuencialmente', () => {
      expect(esTransicionValida('recibido', 'clasificado')).toBe(true);
      expect(esTransicionValida('clasificado', 'en_transito')).toBe(true);
      expect(esTransicionValida('en_transito', 'entregado')).toBe(true);
    });

    test('rechaza retrocesos en cualquier punto', () => {
      expect(esTransicionValida('clasificado', 'recibido')).toBe(false);
      expect(esTransicionValida('en_transito', 'clasificado')).toBe(false);
      expect(esTransicionValida('entregado', 'en_transito')).toBe(false);
    });

    test('rechaza saltos de más de un estado', () => {
      expect(esTransicionValida('recibido', 'en_transito')).toBe(false);
      expect(esTransicionValida('recibido', 'entregado')).toBe(false);
      expect(esTransicionValida('clasificado', 'entregado')).toBe(false);
    });

    test('rechaza permanecer en el mismo estado', () => {
      expect(esTransicionValida('recibido', 'recibido')).toBe(false);
    });
  });

  describe('esEstadoFinal', () => {
    test('entregado es estado final', () => {
      expect(esEstadoFinal('entregado')).toBe(true);
    });

    test('los demás estados no son finales', () => {
      expect(esEstadoFinal('recibido')).toBe(false);
      expect(esEstadoFinal('clasificado')).toBe(false);
      expect(esEstadoFinal('en_transito')).toBe(false);
    });
  });
});
