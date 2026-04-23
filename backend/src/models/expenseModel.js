const { all, get, run } = require("../config/db");

async function createExpense(expense) {
  await run(
    `
      INSERT INTO expenses (id, amount_paise, category, description, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      expense.id,
      expense.amountPaise,
      expense.category,
      expense.description,
      expense.date,
      expense.createdAt,
    ]
  );
}

async function listExpenses({ category, sortByDateDesc }) {
  const params = [];
  const whereClauses = [];

  if (category) {
    whereClauses.push("category = ?");
    params.push(category);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const orderBy = sortByDateDesc ? "ORDER BY date DESC, created_at DESC" : "ORDER BY created_at DESC";

  return all(`SELECT * FROM expenses ${where} ${orderBy}`, params);
}

async function storeIdempotencyRecord({ idempotencyKey, requestHash, expenseId, createdAt }) {
  await run(
    `
      INSERT INTO idempotency_keys (idempotency_key, request_hash, expense_id, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [idempotencyKey, requestHash, expenseId, createdAt]
  );
}

async function getIdempotencyRecord(idempotencyKey) {
  return get(
    `
      SELECT ik.idempotency_key, ik.request_hash, ik.expense_id, e.*
      FROM idempotency_keys ik
      JOIN expenses e ON e.id = ik.expense_id
      WHERE ik.idempotency_key = ?
    `,
    [idempotencyKey]
  );
}

module.exports = {
  createExpense,
  getIdempotencyRecord,
  listExpenses,
  storeIdempotencyRecord,
};
