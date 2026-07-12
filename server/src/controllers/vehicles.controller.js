const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');
const { setVehicleStatus } = require('../services/statusService');

exports.getAll = async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { regNumber: 'asc' },
    });

    return res.json({ vehicles });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { regNumber, name, type, acquisitionCost, status, maxLoadKg, odometer } = req.body;

    if (!regNumber || !name || !type || acquisitionCost === undefined || maxLoadKg === undefined) {
      return res.status(400).json({ error: 'regNumber, name, type, maxLoadKg, and acquisitionCost are required.' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber,
        name,
        type,
        acquisitionCost: parseNumber(acquisitionCost, 'acquisitionCost'),
        maxLoadKg: parseNumber(maxLoadKg, 'maxLoadKg'),
        odometer: parseNumber(odometer, 'odometer') ?? 0,
        status: status || 'AVAILABLE',
      },
    });

    return res.status(201).json({ vehicle });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A vehicle with this registration number already exists.' });
    }
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Vehicle not found.');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...otherData } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Validate and update status via statusService if status is provided
    if (status !== undefined) {
      try {
        await setVehicleStatus(id, status);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    const data = {};
    if (otherData.regNumber !== undefined) data.regNumber = otherData.regNumber;
    if (otherData.name !== undefined) data.name = otherData.name;
    if (otherData.type !== undefined) data.type = otherData.type;
    if (otherData.maxLoadKg !== undefined) data.maxLoadKg = parseNumber(otherData.maxLoadKg, 'maxLoadKg');
    if (otherData.odometer !== undefined) data.odometer = parseNumber(otherData.odometer, 'odometer');
    if (otherData.acquisitionCost !== undefined) data.acquisitionCost = parseNumber(otherData.acquisitionCost, 'acquisitionCost');

    let updatedVehicle = vehicle;
    if (Object.keys(data).length > 0) {
      updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data,
      });
    } else if (status !== undefined) {
      updatedVehicle = await prisma.vehicle.findUnique({ where: { id } });
    }

    return res.json({ vehicle: updatedVehicle });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A vehicle with this registration number already exists.' });
    }
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Vehicle not found.');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(res, error, 'Vehicle not found.');
  }
};

exports.getOperationalCost = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const [fuelSum, maintenanceSum, expenseSum] = await Promise.all([
      prisma.fuelLog.aggregate({
        where: { vehicleId: id },
        _sum: { cost: true },
      }),
      prisma.maintenanceLog.aggregate({
        where: { vehicleId: id },
        _sum: { cost: true },
      }),
      prisma.expense.aggregate({
        where: { vehicleId: id },
        _sum: { amount: true },
      }),
    ]);

    const fuelCost = fuelSum._sum.cost || 0;
    const maintenanceCost = maintenanceSum._sum.cost || 0;
    const expenseCost = expenseSum._sum.amount || 0;
    const operationalCost = fuelCost + maintenanceCost;

    return res.json({
      vehicleId: id,
      regNumber: vehicle.regNumber,
      name: vehicle.name,
      fuelCost,
      maintenanceCost,
      expenseCost,
      operationalCost,
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
