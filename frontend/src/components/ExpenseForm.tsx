import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addExpense, clearError } from "../features/expenses/expensesSlice";
import { DEFAULT_CATEGORIES } from "../constants/categories";

const DRAFT_KEY = "fenmo-expense-draft";

interface DraftForm {
  amount: string;
  category: string;
  description: string;
  date: string;
  idempotencyKey: string;
}

const initialForm: DraftForm = {
  amount: "",
  category: DEFAULT_CATEGORIES[0],
  description: "",
  date: "",
  idempotencyKey: "",
};

function getInitialForm(): DraftForm {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) {
    return initialForm;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<DraftForm>;
    return {
      ...initialForm,
      ...parsed,
    };
  } catch {
    return initialForm;
  }
}

export function ExpenseForm() {
  const dispatch = useAppDispatch();
  const createStatus = useAppSelector((state) => state.expenses.createStatus);
  const error = useAppSelector((state) => state.expenses.error);
  const items = useAppSelector((state) => state.expenses.items);
  const [form, setForm] = useState<DraftForm>(() => getInitialForm());
  const availableCategories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...items.map((item) => item.category)])],
    [items]
  );

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (!error) {
      return;
    }
    toast.error(error);
    dispatch(clearError());
  }, [dispatch, error]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const idempotencyKey = form.idempotencyKey || crypto.randomUUID();
    const payload = { ...form, idempotencyKey };

    try {
      setForm(payload);
      await dispatch(addExpense(payload)).unwrap();
      toast.success("Expense saved.");
      setForm(initialForm);
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Error toast is emitted through Redux error state side-effect.
    }
  }

  return (
    <form
      className="mb-4 grid gap-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-2"
      onSubmit={(event) => void onSubmit(event)}
    >
      <h2 className="md:col-span-2">Add Expense</h2>

      <label className="flex flex-col gap-1 text-sm text-[var(--subtle)]">
        Amount
        <input
          className="rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none ring-indigo-300 focus:ring-2"
          required
          min="0"
          step="0.01"
          type="number"
          value={form.amount}
          onChange={(event) => setForm((previous) => ({ ...previous, amount: event.target.value }))}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm text-[var(--subtle)]">
        <span>Category</span>
        <Autocomplete
          freeSolo
          options={availableCategories}
          value={form.category}
          onChange={(_event, value) =>
            setForm((previous) => ({
              ...previous,
              category: typeof value === "string" ? value : "",
            }))
          }
          onInputChange={(_event, value) =>
            setForm((previous) => ({
              ...previous,
              category: value,
            }))
          }
          renderInput={(params) => <TextField {...params} label="Category" required size="small" />}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.125rem",
              backgroundColor: "var(--surface-2)",
            },
          }}
        />
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--subtle)] md:col-span-2">
        Description
        <input
          className="rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none ring-indigo-300 focus:ring-2"
          required
          maxLength={250}
          type="text"
          value={form.description}
          onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[var(--subtle)]">
        Date
        <input
          className="rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none ring-indigo-300 focus:ring-2"
          required
          type="date"
          value={form.date}
          onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
        />
      </label>

      <button
        className="rounded-sm bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-contrast)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={createStatus === "loading"}
        type="submit"
      >
        {createStatus === "loading" ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}
