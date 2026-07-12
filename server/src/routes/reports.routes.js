const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRoles = require('../middleware/rbac.middleware');
const reportsController = require('../controllers/reports.controller');

router.get('/fuel-efficiency', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER']), reportsController.getFuelEfficiency);
router.get('/utilization', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER']), reportsController.getUtilization);
router.get('/operational-cost', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), reportsController.getOperationalCost);
router.get('/roi', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), reportsController.getRoi);
router.get('/export.csv', auth, requireRoles(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), reportsController.exportCsv);

module.exports = router;
