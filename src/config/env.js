const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

const envFile = NODE_ENV === 'production'
  ? '.env.production'
  : NODE_ENV === 'test'
    ? '.env.test'
    : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

function obligatoria(nombre) {
  const valor = process.env[nombre];
  if (!valor || valor.trim() === '') {
    throw new Error(`Variable de entorno requerida ausente: ${nombre} (archivo: ${envFile})`);
  }
  return valor;
}

const env = {
  nodeEnv: NODE_ENV,
  esProduccion: NODE_ENV === 'production',
  esDesarrollo: NODE_ENV === 'development',
  esTest: NODE_ENV === 'test',

  puerto: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  databaseUrl: obligatoria('DATABASE_URL'),

  jwt: {
    secret: obligatoria('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: obligatoria('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  corsOrigin: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
};

module.exports = env;
