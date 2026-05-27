const { body } = require('express-validator');

const reglasActualizarPerfil = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^\d{8}$/).withMessage('El teléfono debe tener exactamente 8 dígitos numéricos'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 }).withMessage('La dirección debe tener entre 5 y 300 caracteres'),

  body('vehicle')
    .optional({ nullable: true })
    .isLength({ max: 150 }).withMessage('La descripción del vehículo no puede exceder 150 caracteres'),

  body('collectionCenterId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('El centro de acopio debe ser un número entero válido')
    .toInt(),
];

const reglasCambiarPassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('La nueva contraseña debe tener al menos 1 letra mayúscula')
    .matches(/[0-9]/).withMessage('La nueva contraseña debe tener al menos 1 número'),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria')
    .custom((valor, { req }) => {
      if (valor !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

const reglasCrearStaff = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('El nombre completo es obligatorio')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{8}$/).withMessage('El teléfono debe tener exactamente 8 dígitos numéricos'),

  body('address')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ min: 5, max: 300 }).withMessage('La dirección debe tener entre 5 y 300 caracteres'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos 1 letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe tener al menos 1 número'),

  body('vehicle')
    .optional({ nullable: true })
    .isLength({ max: 150 }).withMessage('La descripción del vehículo no puede exceder 150 caracteres'),

  body('collectionCenterId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('El centro de acopio debe ser un número entero válido')
    .toInt(),
];

const reglasCambiarActivo = [
  body('isActive')
    .exists().withMessage('El campo isActive es obligatorio')
    .isBoolean().withMessage('isActive debe ser true o false')
    .toBoolean(),
];

module.exports = {
  reglasActualizarPerfil,
  reglasCambiarPassword,
  reglasCrearStaff,
  reglasCambiarActivo,
};
