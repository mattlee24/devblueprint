"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] text-sm transition-[var(--transition)] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-active)] ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" />
      )}
      {showLabel && (
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
}
