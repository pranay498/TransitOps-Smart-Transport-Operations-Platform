const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/kpis', auth, requireRoles(['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']), dashboardController.getKpis);

module.exports = router;
