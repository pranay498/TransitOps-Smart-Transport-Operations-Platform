const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, parseDate, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const where = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { vehicle: true },
      orderBy: { date: 'desc' },
    });

    return res.json({ expenses });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { vehicleId, category, amount, date } = req.body;

    if (!vehicleId || !category || amount === undefined) {
      return res.status(400).json({ error: 'vehicleId, category, and amount are required.' });
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId,
        category,
        amount: parseNumber(amount, 'amount'),
        date: parseDate(date, 'date'),
      },
    });

    return res.status(201).json({ expense });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }

    return handlePrismaError(res, error, 'Expense not found.');
  }
};
