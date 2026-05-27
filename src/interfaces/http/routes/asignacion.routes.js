const { Router } = require('express');
const { getMisAsignaciones } = require('../controllers/asignacion.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @swagger
 * /assignments/mine:
 *   get:
 *     summary: Listar mis asignaciones (transportista)
 *     description: Devuelve todas las donaciones asignadas a este transportista, con detalle de la donación incluido.
 *     tags: [Transportista]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/mine', autenticar, autorizar('transporter'), getMisAsignaciones);

module.exports = router;
