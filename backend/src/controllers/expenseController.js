const expenseService = require("../services/expenseService");

async function createExpense(req, res, next) {
  try {
    const { expense, replayed } = await expenseService.createExpense(
      req.validated.body,
      req.idempotencyKey
    );

    res.status(replayed ? 200 : 201).json({
      data: expense,
      meta: {
        replayed,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getExpenses(req, res, next) {
  try {
    const data = await expenseService.getExpenses(req.validated.query);
    res.json({
      data: data.expenses,
      meta: {
        total: data.total,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createExpense,
  getExpenses,
};
