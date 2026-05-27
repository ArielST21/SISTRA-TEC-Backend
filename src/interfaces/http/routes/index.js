const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const catalogoRoutes = require('./catalogo.routes');
const donacionRoutes = require('./donacion.routes');
const usuarioRoutes = require('./usuario.routes');
const asignacionRoutes = require('./asignacion.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/catalog', catalogoRoutes);
router.use('/donations', donacionRoutes);
router.use('/users', usuarioRoutes);
router.use('/assignments', asignacionRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
