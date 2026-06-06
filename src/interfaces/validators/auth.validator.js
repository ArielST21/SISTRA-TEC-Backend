const { body } = require('express-validator');

const reglasRegistro = [
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

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria')
    .custom((valor, { req }) => {
      if (valor !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

const reglasLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

const reglasForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
];

const reglasVerificarCodigo = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('code')
    .trim()
    .notEmpty().withMessage('El código es obligatorio')
    .matches(/^\d{6}$/).withMessage('El código debe tener exactamente 6 dígitos numéricos'),
];

const reglasResetPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('code')
    .trim()
    .notEmpty().withMessage('El código es obligatorio')
    .matches(/^\d{6}$/).withMessage('El código debe tener exactamente 6 dígitos numéricos'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos 1 letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe tener al menos 1 número'),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria')
    .custom((valor, { req }) => {
      if (valor !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

module.exports = {
  reglasRegistro,
  reglasLogin,
  reglasForgotPassword,
  reglasVerificarCodigo,
  reglasResetPassword,
};
