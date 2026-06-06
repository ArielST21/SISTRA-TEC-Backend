const { body } = require('express-validator');

const reglasRegistroDonacion = [
  body('donationTypeId')
    .notEmpty().withMessage('El tipo de donación es obligatorio')
    .isInt({ min: 1 }).withMessage('El tipo de donación debe ser un número entero válido')
    .toInt(),

  body('collectionCenterId')
    .notEmpty().withMessage('El centro de acopio es obligatorio')
    .isInt({ min: 1 }).withMessage('El centro de acopio debe ser un número entero válido')
    .toInt(),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ min: 5, max: 500 }).withMessage('La descripción debe tener entre 5 y 500 caracteres'),

  body('pickupAddress')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 300 }).withMessage('La dirección de recolección debe tener entre 5 y 300 caracteres'),

  body('estimatedDeliveryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('La fecha estimada de entrega debe tener el formato YYYY-MM-DD')
    .custom((valor) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (new Date(valor) < hoy) {
        throw new Error('La fecha estimada de entrega debe ser hoy o futura');
      }
      return true;
    }),
];

const reglasAsignarTransportista = [
  body('transporterId')
    .notEmpty().withMessage('El transportista es obligatorio')
    .isUUID().withMessage('El transportista debe ser un UUID válido'),

  body('destination')
    .trim()
    .notEmpty().withMessage('El destino es obligatorio')
    .isLength({ min: 5, max: 300 }).withMessage('El destino debe tener entre 5 y 300 caracteres'),
];

module.exports = { reglasRegistroDonacion, reglasAsignarTransportista };
