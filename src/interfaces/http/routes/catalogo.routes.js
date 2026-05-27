const { Router } = require('express');
const { getTiposDonacion, getCentrosAcopio } = require('../controllers/catalogo.controller');

const router = Router();

/**
 * @swagger
 * /catalog/donation-types:
 *   get:
 *     summary: Listar tipos de donación
 *     description: Devuelve todos los tipos de bienes que se pueden donar. Usar para poblar el selector al registrar una donación.
 *     tags:
 *       - Público
 *     responses:
 *       200:
 *         description: Lista de tipos de donación
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoDonacion'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/donation-types', getTiposDonacion);

/**
 * @swagger
 * /catalog/collection-centers:
 *   get:
 *     summary: Listar centros de acopio
 *     description: Devuelve todos los centros de acopio disponibles. Usar para poblar el selector al registrar una donación.
 *     tags:
 *       - Público
 *     responses:
 *       200:
 *         description: Lista de centros de acopio
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CentroAcopio'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/collection-centers', getCentrosAcopio);

module.exports = router;
