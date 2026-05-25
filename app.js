const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./src/config/env');
const apiRouter = require('./src/interfaces/http/routes');
const { limitadorGlobal } = require('./src/interfaces/http/middlewares/rate-limit.middleware');
const { rutaNoEncontrada, manejadorErrores } = require('./src/interfaces/http/middlewares/error.middleware');
const { verificarConexion, cerrarConexion } = require('./src/infrastructure/database/connection');

const app = express();

// Seguridad
// Content-Security-Policy se relaja solo en development para que la UI de Swagger cargue sus assets inline
app.use(helmet({
  contentSecurityPolicy: env.esDesarrollo ? false : undefined,
}));
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: env.corsOrigin.includes('*') ? true : env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logger
app.use(morgan(env.esProduccion ? 'combined' : 'dev'));

// Rate limit global (no se aplica al health check)
app.use(`/api/${env.apiVersion}`, (req, res, next) => {
  if (req.path === '/health' || req.path === '/health/') return next();
  return limitadorGlobal(req, res, next);
});

// Swagger UI — solo en development
if (process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerEspec = require('./src/config/swagger');
  app.use(
    `/api/${env.apiVersion}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerEspec, {
      customSiteTitle: 'SISTRA-TEC API Docs',
      swaggerOptions: { persistAuthorization: true },
    }),
  );
  console.log(`[Swagger] Docs disponibles en http://localhost:${env.puerto}/api/${env.apiVersion}/docs`);
}

// Rutas
app.use(`/api/${env.apiVersion}`, apiRouter);

// 404 y manejador global de errores
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

// Arranque (omitido cuando se importa desde tests)
if (require.main === module) {
  const servidor = app.listen(env.puerto, async () => {
    console.log(`SISTRA-TEC API iniciada en puerto ${env.puerto} [ambiente: ${env.nodeEnv}]`);
    console.log(`Health check: http://localhost:${env.puerto}/api/${env.apiVersion}/health`);

    try {
      await verificarConexion();
      console.log('[DB] Conexión a Neon verificada correctamente');
    } catch (err) {
      console.error('[DB] No se pudo conectar a Neon al iniciar:', err.message);
    }
  });

  const cierreOrdenado = async (senal) => {
    console.log(`\nRecibida señal ${senal}. Cerrando servidor...`);
    servidor.close(async () => {
      await cerrarConexion();
      console.log('Servidor cerrado correctamente.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => cierreOrdenado('SIGINT'));
  process.on('SIGTERM', () => cierreOrdenado('SIGTERM'));
}

module.exports = app;
