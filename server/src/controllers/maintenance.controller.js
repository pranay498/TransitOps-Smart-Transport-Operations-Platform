const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
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
    const { vehicleId, type, cost, isActive } = req.body;

    if (!vehicleId || !type || cost === undefined) {
      return res.status(400).json({ error: 'vehicleId, type, and cost are required.' });
    }

    const log = await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'IN_SHOP' } });

      return tx.maintenanceLog.create({
        data: {
          vehicleId,
          type,
          cost: parseNumber(cost, 'cost'),
          isActive: isActive === undefined ? true : Boolean(isActive),
        },
      });
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
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const closedLog = await tx.maintenanceLog.update({
        where: { id },
        data: { isActive: false, closedAt: new Date() },
      });

      const activeLogs = await tx.maintenanceLog.count({
        where: { vehicleId: log.vehicleId, isActive: true, id: { not: id } },
      });

      if (activeLogs === 0) {
        await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });
      }

      return closedLog;
    });

    return res.json({ maintenanceLog: updated });
  } catch (error) {
    return handlePrismaError(res, error, 'Maintenance log not found.');
  }
};
