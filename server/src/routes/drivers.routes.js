const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const driversController = require('../controllers/drivers.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), driversController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), driversController.create);
router.put('/:id', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), driversController.update);
router.delete('/:id', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER']), driversController.delete);

module.exports = router;
