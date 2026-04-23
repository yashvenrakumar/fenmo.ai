import { useMemo } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { DEFAULT_CATEGORIES } from "../constants/categories";
import { setCategoryFilter, setSortFilter } from "../features/expenses/expensesSlice";

export function ExpenseFilters() {
  const dispatch = useAppDispatch();
  const { category, sort } = useAppSelector((state) => state.expenses.filters);
  const items = useAppSelector((state) => state.expenses.items);

  const categories = useMemo(() => {
    return [...new Set([...DEFAULT_CATEGORIES, ...items.map((item) => item.category)])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [items]);

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2">
      <FormControl size="small" fullWidth>
        <InputLabel id="filter-category-label">Category</InputLabel>
        <Select
          labelId="filter-category-label"
          label="Category"
          sx={{ borderRadius: "0.125rem" }}
          value={category}
          onChange={(event) => dispatch(setCategoryFilter(event.target.value))}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel id="sort-label">Sort</InputLabel>
        <Select
          labelId="sort-label"
          label="Sort"
          sx={{ borderRadius: "0.125rem" }}
          value={sort}
          onChange={(event) => dispatch(setSortFilter(event.target.value as "date_desc" | ""))}
        >
          <MenuItem value="date_desc">Date (newest first)</MenuItem>
          <MenuItem value="">Created time</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
