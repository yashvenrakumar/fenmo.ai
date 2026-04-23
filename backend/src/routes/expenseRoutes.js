const express = require("express");
const expenseController = require("../controllers/expenseController");
const { extractIdempotencyKey } = require("../middleware/idempotency");
const validate = require("../middleware/validateRequest");
const { createExpenseSchema, listExpenseSchema } = require("../validators/expenseValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Expenses
 *     description: Expense tracking operations
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional idempotency key for safe retries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, category, description, date]
 *             properties:
 *               amount:
 *                 type: string
 *                 example: "499.99"
 *               category:
 *                 type: string
 *                 example: Groceries
 *               description:
 *                 type: string
 *                 example: Weekly household purchase
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-22
 *               idempotencyKey:
 *                 type: string
 *                 example: ui-5f8f8e2a-1ea8-41f8-a2d7-4501f2fcb6b0
 *     responses:
 *       201:
 *         description: Expense created
 *       200:
 *         description: Previously created expense returned from idempotent replay
 */
router.post(
  "/",
  validate(createExpenseSchema, "body"),
  extractIdempotencyKey,
  expenseController.createExpense
);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: List expenses
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter expenses by category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_desc]
 *         required: false
 *         description: Sort by date (newest first)
 *     responses:
 *       200:
 *         description: Expenses fetched successfully
 */
router.get("/", validate(listExpenseSchema, "query"), expenseController.getExpenses);

module.exports = router;
