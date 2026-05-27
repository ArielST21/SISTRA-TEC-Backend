const { obtenerPerfil } = require('../../../application/use-cases/obtener-perfil');
const { actualizarPerfil } = require('../../../application/use-cases/actualizar-perfil');
const { cambiarPassword } = require('../../../application/use-cases/cambiar-password');
const { listarUsuarios } = require('../../../application/use-cases/listar-usuarios');
const { crearUsuarioStaff } = require('../../../application/use-cases/crear-usuario-staff');
const { cambiarEstadoActivo } = require('../../../application/use-cases/cambiar-estado-activo');
const { ROLES } = require('../../../domain/entities/rol-usuario');
const UsuarioRepositoryPg = require('../../../infrastructure/database/repositories/usuario-repository-pg');
const { exito } = require('../utils/respuesta');

const usuarioRepo = new UsuarioRepositoryPg();

async function getMe(req, res, next) {
  try {
    const perfil = await obtenerPerfil(req.usuario.id, usuarioRepo);
    return res.status(200).json(exito(perfil, 'Perfil obtenido exitosamente'));
  } catch (err) { return next(err); }
}

async function patchMe(req, res, next) {
  try {
    const actualizado = await actualizarPerfil(req.usuario.id, req.body, usuarioRepo);
    return res.status(200).json(exito(actualizado, 'Perfil actualizado exitosamente'));
  } catch (err) { return next(err); }
}

async function postChangePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await cambiarPassword({ usuarioId: req.usuario.id, currentPassword, newPassword }, usuarioRepo);
    return res.status(200).json(exito(null, 'Contraseña actualizada exitosamente'));
  } catch (err) { return next(err); }
}

async function getUsers(req, res, next) {
  try {
    const filtros = {};
    if (req.query.role) filtros.role = req.query.role;
    if (req.query.isActive !== undefined) filtros.isActive = req.query.isActive === 'true';
    const usuarios = await listarUsuarios(filtros, usuarioRepo);
    return res.status(200).json(exito(usuarios, 'Usuarios obtenidos exitosamente'));
  } catch (err) { return next(err); }
}

async function postAdmin(req, res, next) {
  try {
    const usuario = await crearUsuarioStaff({ ...req.body, role: ROLES.ADMINISTRADOR }, usuarioRepo);
    return res.status(201).json(exito(usuario, 'Administrador creado exitosamente'));
  } catch (err) { return next(err); }
}

async function postTransporter(req, res, next) {
  try {
    const usuario = await crearUsuarioStaff({ ...req.body, role: ROLES.TRANSPORTISTA }, usuarioRepo);
    return res.status(201).json(exito(usuario, 'Transportista creado exitosamente'));
  } catch (err) { return next(err); }
}

async function patchActive(req, res, next) {
  try {
    const actualizado = await cambiarEstadoActivo(req.params.id, req.body.isActive, usuarioRepo);
    return res.status(200).json(exito(actualizado, 'Estado del usuario actualizado'));
  } catch (err) { return next(err); }
}

module.exports = {
  getMe,
  patchMe,
  postChangePassword,
  getUsers,
  postAdmin,
  postTransporter,
  patchActive,
};
