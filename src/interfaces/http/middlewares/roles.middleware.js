const { fallo } = require('../utils/respuesta');

function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json(
        fallo('Debe autenticarse antes de acceder a este recurso', 'NO_AUTENTICADO'),
      );
    }

    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json(
        fallo(
          'No tiene permisos para acceder a este recurso',
          'ACCESO_DENEGADO',
          `Roles permitidos: ${rolesPermitidos.join(', ')}`,
        ),
      );
    }

    return next();
  };
}

module.exports = { autorizar };
