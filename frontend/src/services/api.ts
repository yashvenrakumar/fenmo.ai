import type { CreateExpensePayload, Expense, ExpenseFilters } from "../types/expense";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const { headers: optionHeaders, ...restOptions } = options ?? {};
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(optionHeaders ?? {}),
    },
  });

  if (!response.ok) {
    const fallbackMessage = `API error: ${response.status}`;
    const maybeJson = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(maybeJson?.error?.message ?? fallbackMessage);
  }

  return (await response.json()) as T;
}

export async function fetchExpenses(filters: ExpenseFilters): Promise<{ data: Expense[]; total: string }> {
  const params = new URLSearchParams();
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await request<{ data: Expense[]; meta: { total: string } }>(`/expenses${query}`);
  return { data: response.data, total: response.meta.total };
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const response = await request<{ data: Expense }>(`/expenses`, {
    method: "POST",
    headers: {
      "Idempotency-Key": payload.idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  return response.data;
}
