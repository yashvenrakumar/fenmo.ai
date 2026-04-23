const { z } = require("zod");

const decimalAmountPattern = /^\d+(\.\d{1,2})?$/;

const createExpenseSchema = z.object({
  amount: z
    .union([z.number(), z.string().trim()])
    .transform((value) => String(value))
    .refine((value) => decimalAmountPattern.test(value), {
      message: "Amount must be a valid monetary value with max 2 decimals.",
    })
    .transform((value) => value.trim())
    .refine((value) => Number(value) >= 0, {
      message: "Amount must be zero or greater.",
    }),
  category: z.string().trim().min(1, "Category is required.").max(60),
  description: z.string().trim().min(1, "Description is required.").max(250),
  date: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Date must be valid ISO date."),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

const listExpenseSchema = z.object({
  category: z.string().trim().optional(),
  sort: z.enum(["date_desc"]).optional(),
});

module.exports = {
  createExpenseSchema,
  listExpenseSchema,
};
