const { Router } = require('express');
const healthController = require('../controllers/health.controller');

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Estado del servicio
 *     description: >
 *       Verifica que el servidor HTTP esté activo y que la conexión a la base
 *       de datos Neon esté operativa. No requiere autenticación.
 *       En caso de fallo de DB responde 503 en lugar de 200.
 *     tags:
 *       - Público
 *     responses:
 *       200:
 *         description: Servicio y base de datos operativos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       type: object
 *                       properties:
 *                         servicio:
 *                           type: string
 *                           example: sistratec-backend
 *                         ambiente:
 *                           type: string
 *                           example: development
 *                         apiVersion:
 *                           type: string
 *                           example: v1
 *                         baseDeDatos:
 *                           type: object
 *                           properties:
 *                             conectada:
 *                               type: boolean
 *                               example: true
 *                             nombre:
 *                               type: string
 *                               example: neondb
 *                             horaServidor:
 *                               type: string
 *                               format: date-time
 *                               example: '2026-05-25T17:29:58.860Z'
 *                         uptimeSegundos:
 *                           type: integer
 *                           example: 42
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: 'Servicio degradado: no se pudo conectar a la base de datos'
 *               datos: null
 *               error:
 *                 codigo: DB_NO_DISPONIBLE
 *                 detalle: null
 */
router.get('/', healthController.consultar);

module.exports = router;
