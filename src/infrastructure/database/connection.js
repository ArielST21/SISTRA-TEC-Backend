const { Pool } = require('pg');
const env = require('../../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: env.esProduccion ? 20 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de conexiones:', err.message);
});

async function ejecutar(sql, parametros = []) {
  const cliente = await pool.connect();
  try {
    const inicio = Date.now();
    const resultado = await cliente.query(sql, parametros);
    if (env.esDesarrollo) {
      const duracion = Date.now() - inicio;
      console.log(`[DB] (${duracion}ms) ${sql.split('\n')[0].slice(0, 80)}...`);
    }
    return resultado;
  } finally {
    cliente.release();
  }
}

async function enTransaccion(callback) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await callback(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

async function verificarConexion() {
  const { rows } = await ejecutar('SELECT NOW() AS hora_actual, current_database() AS base');
  return rows[0];
}

async function cerrarConexion() {
  await pool.end();
}

module.exports = {
  pool,
  ejecutar,
  enTransaccion,
  verificarConexion,
  cerrarConexion,
};
