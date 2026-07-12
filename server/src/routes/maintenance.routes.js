const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const maintenanceController = require('../controllers/maintenance.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), maintenanceController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), maintenanceController.create);
router.patch('/:id/close', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), maintenanceController.close);

module.exports = router;
