import { useMemo } from "react";
import { useAppSelector } from "../app/hooks";

function toPaise(amount: string): number {
  return Math.round(Number(amount) * 100);
}

function formatFromPaise(value: number): string {
  return (value / 100).toFixed(2);
}

export function ExpenseSummary() {
  const items = useAppSelector((state) => state.expenses.items);

  const rows = useMemo(() => {
    const grouped = new Map<string, number>();

    items.forEach((item) => {
      grouped.set(item.category, (grouped.get(item.category) ?? 0) + toPaise(item.amount));
    });

    return [...grouped.entries()]
      .map(([category, amountPaise]) => ({
        category,
        total: formatFromPaise(amountPaise),
      }))
      .sort((a, b) => Number(b.total) - Number(a.total));
  }, [items]);

  return (
    <section className="mb-4 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <h2>Category Summary</h2>
      {!rows.length ? (
        <div className="rounded-sm border border-dashed border-[var(--border)] p-4 text-center text-[var(--subtle)]">
          No category totals yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              key={row.category}
            >
              <span>{row.category}</span>
              <strong>Rs {row.total}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
