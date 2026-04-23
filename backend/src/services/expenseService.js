const crypto = require("node:crypto");
const expenseModel = require("../models/expenseModel");

function amountToPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function paiseToDisplayAmount(paise) {
  return (paise / 100).toFixed(2);
}

function normalizeDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildRequestHash(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function mapExpenseRow(row) {
  return {
    id: row.id,
    amount: paiseToDisplayAmount(row.amount_paise),
    category: row.category,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
  };
}

async function createExpense(payload, idempotencyKey) {
  const normalizedPayload = {
    amount: payload.amount,
    category: payload.category.trim(),
    description: payload.description.trim(),
    date: normalizeDate(payload.date),
  };
  const requestHash = buildRequestHash(normalizedPayload);

  if (idempotencyKey) {
    const existing = await expenseModel.getIdempotencyRecord(idempotencyKey);
    if (existing) {
      if (existing.request_hash !== requestHash) {
        const error = new Error("Idempotency key re-used with different payload.");
        error.status = 409;
        throw error;
      }

      return {
        expense: mapExpenseRow(existing),
        replayed: true,
      };
    }
  }

  const expense = {
    id: crypto.randomUUID(),
    amountPaise: amountToPaise(normalizedPayload.amount),
    category: normalizedPayload.category,
    description: normalizedPayload.description,
    date: normalizedPayload.date,
    createdAt: new Date().toISOString(),
  };

  await expenseModel.createExpense(expense);

  if (idempotencyKey) {
    await expenseModel.storeIdempotencyRecord({
      idempotencyKey,
      requestHash,
      expenseId: expense.id,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    expense: mapExpenseRow({
      id: expense.id,
      amount_paise: expense.amountPaise,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      created_at: expense.createdAt,
    }),
    replayed: false,
  };
}

async function getExpenses(filters) {
  const rows = await expenseModel.listExpenses({
    category: filters.category,
    sortByDateDesc: filters.sort === "date_desc",
  });

  const expenses = rows.map(mapExpenseRow);
  const totalAmountPaise = rows.reduce((sum, row) => sum + row.amount_paise, 0);

  return {
    expenses,
    total: paiseToDisplayAmount(totalAmountPaise),
  };
}

module.exports = {
  createExpense,
  getExpenses,
};
