const { Router } = require('express');
const {
  getMe,
  patchMe,
  postChangePassword,
  getUsers,
  postAdmin,
  postTransporter,
  patchActive,
  patchUser,
  getTransportersTracking,
} = require('../controllers/usuario.controller');
const {
  reglasActualizarPerfil,
  reglasCambiarPassword,
  reglasCrearStaff,
  reglasCambiarActivo,
} = require('../../validators/usuario.validator');
const { validar } = require('../middlewares/validar.middleware');
const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil propio
 *     tags: [Donante, Transportista, Administrador]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/me', autenticar, getMe);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Actualizar datos propios
 *     description: Cada rol puede actualizar campos distintos. Donante - nombre, email, teléfono, dirección. Transportista - agrega vehículo y centro. Admin - agrega centro.
 *     tags: [Donante, Transportista, Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string, pattern: '^\d{8}$' }
 *               address: { type: string }
 *               vehicle: { type: string, nullable: true }
 *               collectionCenterId: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       409:
 *         description: Email o teléfono duplicado
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/me', autenticar, reglasActualizarPerfil, validar, patchMe);

/**
 * @swagger
 * /users/me/change-password:
 *   post:
 *     summary: Cambiar contraseña propia
 *     tags: [Donante, Transportista, Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 8 caracteres, 1 mayúscula y 1 número
 *               confirmPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         description: Contraseña actual incorrecta
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/me/change-password', autenticar, reglasCambiarPassword, validar, postChangePassword);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuarios (admin) — soporta filtros por rol y estado
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           $ref: '#/components/schemas/RolEnum'
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/', autenticar, autorizar('admin'), getUsers);

/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Crear nuevo administrador (admin)
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, address, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string, pattern: '^\d{8}$' }
 *               address: { type: string }
 *               password: { type: string, format: password }
 *               collectionCenterId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Administrador creado
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       409:
 *         description: Email o teléfono duplicado
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/admin', autenticar, autorizar('admin'), reglasCrearStaff, validar, postAdmin);

/**
 * @swagger
 * /users/transporter:
 *   post:
 *     summary: Crear nuevo transportista (admin)
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, address, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string, pattern: '^\d{8}$' }
 *               address: { type: string }
 *               password: { type: string, format: password }
 *               vehicle: { type: string, nullable: true }
 *               collectionCenterId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Transportista creado
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       409:
 *         description: Email o teléfono duplicado
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/transporter', autenticar, autorizar('admin'), reglasCrearStaff, validar, postTransporter);

/**
 * @swagger
 * /users/{id}/active:
 *   patch:
 *     summary: Activar o desactivar un usuario (admin)
 *     tags: [Administrador]
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
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id/active', autenticar, autorizar('admin'), reglasCambiarActivo, validar, patchActive);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Editar datos de un usuario (admin)
 *     tags: [Administrador]
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
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string, pattern: '^\d{8}$' }
 *               vehicle: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.patch('/:id', autenticar, autorizar('admin'), reglasActualizarPerfil, validar, patchUser);

/**
 * @swagger
 * /users/transporters/tracking:
 *   get:
 *     summary: Seguimiento de todos los transportistas con sus asignaciones (admin)
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transportistas con sus asignaciones activas
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.get('/transporters/tracking', autenticar, autorizar('admin'), getTransportersTracking);

module.exports = router;
