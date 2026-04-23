import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleTheme } from "../features/theme/themeSlice";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className="rounded-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]"
      type="button"
      onClick={() => dispatch(toggleTheme())}
    >
      {mode === "dark" ? "Switch to Light" : "Switch to Dark"}
    </motion.button>
  );
}
