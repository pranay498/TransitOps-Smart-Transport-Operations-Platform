const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
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
        status,
      },
    });

    return res.status(201).json({ vehicle });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }

    return handlePrismaError(res, error, 'Vehicle not found.');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {};

    if (req.body.regNumber !== undefined) data.regNumber = req.body.regNumber;
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.maxLoadKg !== undefined) data.maxLoadKg = parseNumber(req.body.maxLoadKg, 'maxLoadKg');
    if (req.body.odometer !== undefined) data.odometer = parseNumber(req.body.odometer, 'odometer');
    if (req.body.acquisitionCost !== undefined) data.acquisitionCost = parseNumber(req.body.acquisitionCost, 'acquisitionCost');

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return res.json({ vehicle });
  } catch (error) {
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
