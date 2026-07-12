const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const tripsController = require('../controllers/trips.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER']), tripsController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER']), tripsController.create);
router.patch('/:id/dispatch', auth, requireRoles(['FLEET_MANAGER']), tripsController.dispatch);
router.patch('/:id/complete', auth, requireRoles(['FLEET_MANAGER']), tripsController.complete);
router.patch('/:id/cancel', auth, requireRoles(['FLEET_MANAGER']), tripsController.cancel);

module.exports = router;
