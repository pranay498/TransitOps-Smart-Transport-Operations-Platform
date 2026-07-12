const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');
const { setVehicleStatus } = require('../services/statusService');

exports.getAll = async (req, res) => {
  try {
    const { vehicleId, isActive } = req.query;
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const logs = await prisma.maintenanceLog.findMany({
      where,
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ maintenanceLogs: logs });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { vehicleId, type, cost } = req.body;

    if (!vehicleId || !type || cost === undefined) {
      return res.status(400).json({ error: 'vehicleId, type, and cost are required.' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found.' });
    }
    if (vehicle.status === 'RETIRED') {
      return res.status(400).json({ error: 'Cannot log maintenance for a RETIRED vehicle.' });
    }

    
    try {
      await setVehicleStatus(vehicleId, 'IN_SHOP');
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId,
        type,
        cost: parseNumber(cost, 'cost'),
        isActive: true,
      },
      include: { vehicle: true },
    });

    return res.status(201).json({ maintenanceLog: log });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Maintenance log not found.');
  }
};

exports.close = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found.' });
    }
    if (!log.isActive) {
      return res.status(400).json({ error: 'Maintenance log is already closed.' });
    }

    const closedLog = await prisma.maintenanceLog.update({
      where: { id },
      data: { isActive: false, closedAt: new Date() },
      include: { vehicle: true },
    });

    // Check whether any other active logs still hold this vehicle in shop
    const remainingActive = await prisma.maintenanceLog.count({
      where: { vehicleId: log.vehicleId, isActive: true },
    });

    if (remainingActive === 0) {
      // Only transition AVAILABLE if vehicle is not RETIRED
      if (log.vehicle.status !== 'RETIRED') {
        try {
          await setVehicleStatus(log.vehicleId, 'AVAILABLE');
        } catch (err) {
          // statusService will throw if RETIRED → AVAILABLE is attempted — ignore safely
        }
      }
    }

    return res.json({ maintenanceLog: closedLog });
  } catch (error) {
    return handlePrismaError(res, error, 'Maintenance log not found.');
  }
};
