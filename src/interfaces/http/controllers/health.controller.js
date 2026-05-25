const { verificarConexion } = require('../../../infrastructure/database/connection');
const { exito, fallo } = require('../utils/respuesta');
const env = require('../../../config/env');

async function consultar(req, res) {
  try {
    const info = await verificarConexion();
    return res.status(200).json(
      exito(
        {
          servicio: 'sistratec-backend',
          ambiente: env.nodeEnv,
          apiVersion: env.apiVersion,
          baseDeDatos: {
            conectada: true,
            nombre: info.base,
            horaServidor: info.hora_actual,
          },
          uptimeSegundos: Math.floor(process.uptime()),
        },
        'Servicio operativo',
      ),
    );
  } catch (err) {
    return res.status(503).json(
      fallo(
        'Servicio degradado: no se pudo conectar a la base de datos',
        'DB_NO_DISPONIBLE',
        env.esProduccion ? null : err.message,
      ),
    );
  }
}

module.exports = { consultar };
