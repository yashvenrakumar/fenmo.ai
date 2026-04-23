export interface Expense {
  id: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface ExpenseFilters {
  category: string;
  sort: "date_desc" | "";
}

export interface CreateExpensePayload {
  amount: string;
  category: string;
  description: string;
  date: string;
  idempotencyKey: string;
}
