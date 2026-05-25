const { Router } = require('express');
const { register } = require('../controllers/auth.controller');
const { reglasRegistro } = require('../../validators/auth.validator');
const { validar } = require('../middlewares/validar.middleware');
const { limitadorAuth } = require('../middlewares/rate-limit.middleware');

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo donante
 *     description: >
 *       Crea una cuenta con rol `donor`. Devuelve el usuario creado junto con
 *       un par de tokens JWT (access + refresh) para que el frontend pueda
 *       autenticar al usuario inmediatamente sin necesidad de un login adicional.
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - address
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 150
 *                 example: María Fernández Solís
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.fernandez@example.com
 *               phone:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *                 description: Exactamente 8 dígitos numéricos
 *                 example: '88881234'
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 300
 *                 example: San José, 100m norte del parque central
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Mínimo 8 caracteres, 1 mayúscula y 1 número
 *                 example: MiClave123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Debe ser idéntica a password
 *                 example: MiClave123
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
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
 *                         usuario:
 *                           $ref: '#/components/schemas/Usuario'
 *                         accessToken:
 *                           type: string
 *                           description: JWT de acceso (válido 15 minutos)
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                         refreshToken:
 *                           type: string
 *                           description: JWT de refresco (válido 7 días)
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaError'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: object
 *                       properties:
 *                         codigo:
 *                           example: VALIDACION_FALLIDA
 *                         detalle:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               campo:
 *                                 type: string
 *                                 example: telefono
 *                               mensaje:
 *                                 type: string
 *                                 example: El teléfono debe tener exactamente 8 dígitos numéricos
 *       409:
 *         description: El correo ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: Ya existe una cuenta con ese correo electrónico
 *               datos: null
 *               error:
 *                 codigo: EMAIL_DUPLICADO
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/register', limitadorAuth, reglasRegistro, validar, register);

module.exports = router;
