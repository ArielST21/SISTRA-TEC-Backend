const { Router } = require('express');
const { getAdminMetrics, getMyMetrics } = require('../controllers/dashboard.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Métricas globales del sistema (admin)
 *     description: Devuelve totales por estado, por tipo de donación y por centro de acopio.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/metrics', autenticar, autorizar('admin'), getAdminMetrics);

/**
 * @swagger
 * /dashboard/mine:
 *   get:
 *     summary: Métricas del transportista autenticado
 *     description: Devuelve el conteo de envíos en tránsito, entregados y total asignados.
 *     tags: [Transportista]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del transportista
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/mine', autenticar, autorizar('transporter'), getMyMetrics);

module.exports = router;
