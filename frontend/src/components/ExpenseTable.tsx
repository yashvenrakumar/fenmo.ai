import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "../app/hooks";

export function ExpenseTable() {
  const { items, listStatus } = useAppSelector((state) => state.expenses);

  if (listStatus === "loading") {
    return (
      <div className="rounded-sm border border-dashed border-[var(--border)] p-4 text-center text-[var(--subtle)]">
        Loading expenses...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--border)] p-4 text-center text-[var(--subtle)]">
        No expenses yet. Add your first transaction above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-[var(--border)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs tracking-wide text-[var(--subtle)] uppercase">
              Date
            </th>
            <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs tracking-wide text-[var(--subtle)] uppercase">
              Category
            </th>
            <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs tracking-wide text-[var(--subtle)] uppercase">
              Description
            </th>
            <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs tracking-wide text-[var(--subtle)] uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {items.map((expense) => (
              <motion.tr
                key={expense.id}
                className="transition-colors hover:bg-[var(--surface-2)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <td className="border-b border-[var(--border)] px-3 py-3 whitespace-nowrap">{expense.date}</td>
                <td className="border-b border-[var(--border)] px-3 py-3 whitespace-nowrap">
                  {expense.category}
                </td>
                <td className="border-b border-[var(--border)] px-3 py-3">{expense.description}</td>
                <td className="border-b border-[var(--border)] px-3 py-3 whitespace-nowrap">Rs {expense.amount}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
