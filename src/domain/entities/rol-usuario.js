const ROLES = Object.freeze({
  DONANTE: 'donor',
  TRANSPORTISTA: 'transporter',
  ADMINISTRADOR: 'admin',
});

const ROLES_VALIDOS = Object.values(ROLES);

function esRolValido(rol) {
  return ROLES_VALIDOS.includes(rol);
}

module.exports = {
  ROLES,
  ROLES_VALIDOS,
  esRolValido,
};
