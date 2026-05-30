const { Router } = require('express');
const donacionController = require('../controllers/donacion.controller');

const router = Router();

/**
 * @swagger
 * /track/{trackingId}:
 *   get:
 *     summary: Rastrear donación por código público
 *     description: >
 *       Consulta el estado de una donación ingresando su código de rastreo.
 *       No requiere autenticación. Devuelve el estado actual, fecha de registro,
 *       fecha estimada de entrega y bitácora de transiciones de estado.
 *     tags:
 *       - Público
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *           example: DON-2026-A4F9
 *         description: Código de rastreo de la donación (formato DON-YYYY-XXXX)
 *     responses:
 *       200:
 *         description: Donación encontrada exitosamente
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
 *                         codigo:
 *                           type: string
 *                           example: DON-2026-A4F9
 *                         estado:
 *                           $ref: '#/components/schemas/EstadoDonacionEnum'
 *                         descripcion:
 *                           type: string
 *                           example: Alimentos no perecederos
 *                         fechaRegistro:
 *                           type: string
 *                           format: date-time
 *                         fechaEstimadaEntrega:
 *                           type: string
 *                           format: date
 *                         fechaEntregado:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         eventos:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               estado:
 *                                 type: string
 *                               estadoAnterior:
 *                                 type: string
 *                               fecha:
 *                                 type: string
 *                                 format: date-time
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       404:
 *         description: Código de rastreo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: Donación no encontrada. Verifica que el código sea correcto.
 *               datos: null
 *               error:
 *                 codigo: DONACION_NO_ENCONTRADA
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/track/:trackingId', donacionController.rastrear);

module.exports = router;
