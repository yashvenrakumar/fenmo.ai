import { useEffect, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseSummary } from "./components/ExpenseSummary";
import { ExpenseTable } from "./components/ExpenseTable";
import { ThemeToggle } from "./components/ThemeToggle";
import { loadExpenses } from "./features/expenses/expensesSlice";

function App() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const total = useAppSelector((state) => state.expenses.total);
  const filters = useAppSelector((state) => state.expenses.filters);
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        shape: {
          borderRadius: 2,
        },
      }),
    [mode]
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    void dispatch(loadExpenses());
  }, [dispatch, filters.category, filters.sort]);

  return (
    <ThemeProvider theme={muiTheme}>
      <main className="mx-auto min-h-screen w-full max-w-5xl bg-[var(--bg)] px-4 py-6 md:px-6">
        <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-semibold tracking-tight text-[var(--text)]">Fenmo Expense Tracker</h1>
            <p className="text-[var(--subtle)]">Production-style expense workflow with retry-safe writes.</p>
          </div>
          <ThemeToggle />
        </header>

        <ExpenseForm />
        <ExpenseSummary />

        <motion.section
          className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2>Expenses</h2>
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
              Total: Rs {total}
            </div>
          </div>
          <ExpenseFilters />
          <ExpenseTable />
        </motion.section>
      </main>
    </ThemeProvider>
  );
}

export default App;
