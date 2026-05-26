const { registrarDonante } = require('../../../application/use-cases/registrar-donante');
const { iniciarSesion } = require('../../../application/use-cases/iniciar-sesion');
const { renovarToken } = require('../../../application/use-cases/renovar-token');
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

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await iniciarSesion({ email, password }, usuarioRepo);

    return res.status(200).json(
      exito(resultado, 'Sesión iniciada exitosamente'),
    );
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const resultado = await renovarToken({ refreshToken }, usuarioRepo);

    return res.status(200).json(
      exito(resultado, 'Token renovado exitosamente'),
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh };
