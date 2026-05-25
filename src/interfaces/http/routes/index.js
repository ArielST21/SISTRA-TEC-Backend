const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// TODO: registrar aquí las rutas de cada recurso conforme se implementen:
// router.use('/donations', donationRoutes);
// router.use('/users', userRoutes);
// router.use('/transporters', transporterRoutes);

module.exports = router;
