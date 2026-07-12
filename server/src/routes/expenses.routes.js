const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const expensesController = require('../controllers/expenses.controller');

router.get('/', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), expensesController.getAll);
router.post('/', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), expensesController.create);

module.exports = router;
