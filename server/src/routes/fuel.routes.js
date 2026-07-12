const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const fuelController = require('../controllers/fuel.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), fuelController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), fuelController.create);

module.exports = router;
