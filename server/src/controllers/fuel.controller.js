const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, parseDate, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const where = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const fuelLogs = await prisma.fuelLog.findMany({
      where,
      include: { vehicle: true },
      orderBy: { date: 'desc' },
    });

    return res.json({ fuelLogs });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { vehicleId, liters, cost, date } = req.body;

    if (!vehicleId || liters === undefined || cost === undefined) {
      return res.status(400).json({ error: 'vehicleId, liters, and cost are required.' });
    }

    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId,
        liters: parseNumber(liters, 'liters'),
        cost: parseNumber(cost, 'cost'),
        date: parseDate(date, 'date'),
      },
    });

    return res.status(201).json({ fuelLog });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }

    return handlePrismaError(res, error, 'Fuel log not found.');
  }
};
