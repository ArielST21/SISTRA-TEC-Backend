const { registrarDonante } = require('../../../application/use-cases/registrar-donante');
const UsuarioRepositoryPg = require('../../../infrastructure/database/repositories/usuario-repository-pg');
const { exito } = require('../utils/respuesta');

const usuarioRepo = new UsuarioRepositoryPg();

async function register(req, res, next) {
  try {
    const { fullName, email, phone, address, password } = req.body;
    const resultado = await registrarDonante({ fullName, email, phone, address, password }, usuarioRepo);

    return res.status(201).json(
      exito(resultado, 'Cuenta creada exitosamente'),
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { register };
