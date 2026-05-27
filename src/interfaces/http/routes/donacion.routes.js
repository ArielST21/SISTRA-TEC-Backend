const { Router } = require('express');
const {
  createDonacion,
  getMisDonaciones,
  getDonacion,
  trackDonacion,
  getAllDonaciones,
  classifyDonacion,
  transitDonacion,
  deliverDonacion,
  assignTransportista,
  deleteDonacion,
  getDonacionTracking,
} = require('../controllers/donacion.controller');
const { reglasRegistroDonacion, reglasAsignarTransportista } = require('../../validators/donacion.validator');
const { validar } = require('../middlewares/validar.middleware');
const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @swagger
 * /donations:
 *   post:
 *     summary: Registrar una donación
 *     description: >
 *       Crea una nueva donación en estado `recibido`. El `donor_id` se toma
 *       automáticamente del token JWT — el donante no lo envía.
 *       El `tracking_id` es generado por el backend (formato DON-AAAA-XXXX).
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - donationTypeId
 *               - collectionCenterId
 *               - descripcion
 *             properties:
 *               donationTypeId:
 *                 type: integer
 *                 description: ID del tipo de bien donado (obtener de GET /catalog/donation-types)
 *                 example: 1
 *               collectionCenterId:
 *                 type: integer
 *                 description: ID del centro de acopio (obtener de GET /catalog/collection-centers)
 *                 example: 2
 *               descripcion:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: 3 cajas de arroz, 2 latas de atún y 5 paquetes de frijoles
 *               pickupAddress:
 *                 type: string
 *                 nullable: true
 *                 minLength: 5
 *                 maxLength: 300
 *                 description: Dirección de recolección si no se entrega en el centro (opcional)
 *                 example: Cartago, Residencial Los Pinos, casa #5
 *               estimatedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha estimada de entrega al beneficiario, formato YYYY-MM-DD (opcional)
 *                 example: '2026-06-15'
 *     responses:
 *       201:
 *         description: Donación registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       $ref: '#/components/schemas/Donacion'
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: Tipo de donación o centro de acopio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: El tipo de donación no existe
 *               datos: null
 *               error:
 *                 codigo: TIPO_DONACION_NO_ENCONTRADO
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/', autenticar, autorizar('donor'), reglasRegistroDonacion, validar, createDonacion);

/**
 * @swagger
 * /donations/mine:
 *   get:
 *     summary: Listar mis donaciones
 *     description: Devuelve todas las donaciones del donante autenticado, ordenadas de más reciente a más antigua.
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de donaciones del donante
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
 *                         $ref: '#/components/schemas/Donacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/mine', autenticar, autorizar('donor'), getMisDonaciones);

/**
 * @swagger
 * /donations/track/{trackingId}:
 *   get:
 *     summary: Consultar donación por código de seguimiento
 *     description: Endpoint público. Cualquier persona con el código puede consultar el estado de la donación.
 *     tags:
 *       - Público
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de seguimiento (formato DON-AAAA-XXXX)
 *         example: DON-2026-A4F9
 *     responses:
 *       200:
 *         description: Donación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       $ref: '#/components/schemas/Donacion'
 *       404:
 *         description: Código de seguimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: No se encontró ninguna donación con ese código de seguimiento
 *               datos: null
 *               error:
 *                 codigo: DONACION_NO_ENCONTRADA
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/track/:trackingId', trackDonacion);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Obtener detalle de una donación propia
 *     description: Devuelve el detalle de una donación. Solo el donante dueño puede verla.
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de la donación
 *     responses:
 *       200:
 *         description: Donación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       $ref: '#/components/schemas/Donacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
/**
 * @swagger
 * /donations:
 *   get:
 *     summary: Listar todas las donaciones con filtros (admin)
 *     description: Devuelve todas las donaciones del sistema. Soporta filtros opcionales por estado, tipo, centro, código de seguimiento y nombre del donante.
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/EstadoDonacionEnum'
 *       - in: query
 *         name: collectionCenterId
 *         schema: { type: integer }
 *       - in: query
 *         name: donationTypeId
 *         schema: { type: integer }
 *       - in: query
 *         name: trackingId
 *         schema: { type: string }
 *         description: Búsqueda parcial por código de seguimiento
 *       - in: query
 *         name: donorName
 *         schema: { type: string }
 *         description: Búsqueda parcial por nombre del donante
 *     responses:
 *       200:
 *         description: Lista de donaciones (enriquecida con nombre del donante, tipo y centro)
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/', autenticar, autorizar('admin'), getAllDonaciones);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Obtener detalle de una donación propia
 *     description: Devuelve el detalle de una donación. Solo el donante dueño puede verla.
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Donación encontrada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/:id', autenticar, autorizar('donor'), getDonacion);

/**
 * @swagger
 * /donations/{id}/tracking:
 *   get:
 *     summary: Obtener la bitácora de eventos de una donación
 *     description: Devuelve los eventos de cambio de estado en orden cronológico. Cualquier usuario autenticado puede consultarla.
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de eventos
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/:id/tracking', autenticar, getDonacionTracking);

/**
 * @swagger
 * /donations/{id}/classify:
 *   patch:
 *     summary: Clasificar donación (admin) — pasa de recibido a clasificado
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Donación clasificada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       409:
 *         description: Transición de estado inválida
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id/classify', autenticar, autorizar('admin'), classifyDonacion);

/**
 * @swagger
 * /donations/{id}/assign:
 *   post:
 *     summary: Asignar un transportista a una donación clasificada (admin)
 *     tags:
 *       - Administrador
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transporterId, destination]
 *             properties:
 *               transporterId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID del transportista. Debe tener un vehículo registrado en su perfil.
 *               destination:
 *                 type: string
 *                 example: Albergue Municipal de Cartago, contiguo al estadio
 *     responses:
 *       201:
 *         description: Transportista asignado
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       409:
 *         description: Donación ya asignada o estado inválido
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/:id/assign', autenticar, autorizar('admin'), reglasAsignarTransportista, validar, assignTransportista);

/**
 * @swagger
 * /donations/{id}/transit:
 *   patch:
 *     summary: Marcar donación como en tránsito (transportista asignado)
 *     tags:
 *       - Transportista
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Donación marcada como en tránsito
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       409:
 *         description: Transición de estado inválida
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id/transit', autenticar, autorizar('transporter'), transitDonacion);

/**
 * @swagger
 * /donations/{id}/deliver:
 *   patch:
 *     summary: Confirmar entrega final (transportista asignado o admin)
 *     description: Marca la donación como entregada. Esta acción es irreversible.
 *     tags:
 *       - Transportista
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Donación marcada como entregada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       409:
 *         description: Transición inválida o donación ya bloqueada
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id/deliver', autenticar, autorizar('transporter', 'admin'), deliverDonacion);

/**
 * @swagger
 * /donations/{id}:
 *   delete:
 *     summary: Cancelar una donación propia (solo si está en recibido)
 *     tags:
 *       - Donante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Donación cancelada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       409:
 *         description: La donación ya no está en estado recibido
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.delete('/:id', autenticar, autorizar('donor'), deleteDonacion);

module.exports = router;
