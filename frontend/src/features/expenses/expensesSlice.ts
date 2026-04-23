import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createExpense, fetchExpenses } from "../../services/api";
import type { CreateExpensePayload, Expense, ExpenseFilters } from "../../types/expense";
import type { RootState } from "../../app/store";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface ExpensesState {
  items: Expense[];
  total: string;
  filters: ExpenseFilters;
  listStatus: RequestStatus;
  createStatus: RequestStatus;
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  total: "0.00",
  filters: {
    category: "",
    sort: "date_desc",
  },
  listStatus: "idle",
  createStatus: "idle",
  error: null,
};

export const loadExpenses = createAsyncThunk("expenses/load", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const response = await fetchExpenses(state.expenses.filters);
    return response;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const addExpense = createAsyncThunk(
  "expenses/create",
  async (payload: CreateExpensePayload, { dispatch, rejectWithValue }) => {
    try {
      await createExpense(payload);
      await dispatch(loadExpenses()).unwrap();
      return true;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.filters.category = action.payload;
    },
    setSortFilter(state, action: PayloadAction<ExpenseFilters["sort"]>) {
      state.filters.sort = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadExpenses.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(loadExpenses.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(loadExpenses.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = String(action.payload ?? "Failed to load expenses.");
      })
      .addCase(addExpense.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = String(action.payload ?? "Failed to create expense.");
      });
  },
});

export const { clearError, setCategoryFilter, setSortFilter } = expensesSlice.actions;
export default expensesSlice.reducer;
