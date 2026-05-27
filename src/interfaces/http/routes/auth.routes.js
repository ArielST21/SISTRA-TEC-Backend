const { Router } = require('express');
const {
  register,
  login,
  refresh,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require('../controllers/auth.controller');
const {
  reglasRegistro,
  reglasLogin,
  reglasForgotPassword,
  reglasVerificarCodigo,
  reglasResetPassword,
} = require('../../validators/auth.validator');
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: >
 *       Autentica a un usuario con correo y contraseña. Devuelve el usuario
 *       y un par de tokens JWT (access + refresh). El error es genérico
 *       (no revela si el correo existe) para evitar enumeración de usuarios.
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.fernandez@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiClave123
 *     responses:
 *       200:
 *         description: Sesión iniciada exitosamente
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
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: Correo o contraseña incorrectos
 *               datos: null
 *               error:
 *                 codigo: CREDENCIALES_INVALIDAS
 *                 detalle: null
 *       403:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: Esta cuenta ha sido desactivada
 *               datos: null
 *               error:
 *                 codigo: CUENTA_INACTIVA
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/login', limitadorAuth, reglasLogin, validar, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     description: >
 *       Recibe un refresh token válido y devuelve un nuevo access token.
 *       Usar cuando el access token expire (cada 15 minutos).
 *       El refresh token no cambia (válido 7 días desde su emisión).
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token obtenido en login o register
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
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
 *                         accessToken:
 *                           type: string
 *                           description: Nuevo JWT de acceso (válido 15 minutos)
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: El token de refresco es inválido o ha expirado
 *               datos: null
 *               error:
 *                 codigo: REFRESH_TOKEN_INVALIDO
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     description: >
 *       Envía un código de 6 dígitos al correo del usuario. La respuesta es
 *       genérica (no revela si el correo existe) para evitar enumeración.
 *       En desarrollo, el código también se incluye en `datos.codigoDev` para
 *       facilitar pruebas sin abrir el correo.
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.fernandez@example.com
 *     responses:
 *       200:
 *         description: Solicitud procesada (respuesta genérica)
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
 *                         ttlMinutos: { type: integer, example: 15 }
 *                         codigoDev:
 *                           type: string
 *                           description: Solo en development. El código generado.
 *                           example: '483920'
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/forgot-password', limitadorAuth, reglasForgotPassword, validar, forgotPassword);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verificar código de recuperación
 *     description: >
 *       Verifica que el código enviado al correo sea correcto y esté vigente.
 *       NO consume el código — eso ocurre cuando se llama a /reset-password.
 *       Sirve para que el frontend valide el código antes de mostrar el
 *       formulario de nueva contraseña.
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: '483920'
 *     responses:
 *       200:
 *         description: Código válido
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
 *                         valido: { type: boolean, example: true }
 *       400:
 *         description: Código inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *             example:
 *               exito: false
 *               mensaje: El código es inválido o ha expirado
 *               datos: null
 *               error:
 *                 codigo: CODIGO_INVALIDO
 *                 detalle: null
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/verify-reset-code', limitadorAuth, reglasVerificarCodigo, validar, verifyResetCode);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con código
 *     description: >
 *       Cambia la contraseña del usuario. Requiere el código vigente.
 *       El código se consume tras un reset exitoso.
 *     tags:
 *       - Público
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword, confirmPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, pattern: '^\d{6}$', example: '483920' }
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 8 caracteres, 1 mayúscula y 1 número
 *                 example: NuevaClave123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NuevaClave123
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Validación fallida o código inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaError'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/reset-password', limitadorAuth, reglasResetPassword, validar, resetPassword);

module.exports = router;
