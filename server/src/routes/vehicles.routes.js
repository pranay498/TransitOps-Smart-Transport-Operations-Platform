const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const vehiclesController = require('../controllers/vehicles.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER']), vehiclesController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER']), vehiclesController.create);
router.put('/:id', auth, requireRoles(['FLEET_MANAGER']), vehiclesController.update);
router.delete('/:id', auth, requireRoles(['FLEET_MANAGER']), vehiclesController.delete);

module.exports = router;
