"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  "aria-label"?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDisplayDate(value: string | undefined): string {
  if (!value || value.length < 10) return "";
  const [y, m, d] = value.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return value;
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Pick a date",
  label,
  className = "",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m)) return new Date(y, m - 1, 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function selectDay(d: number) {
    const yyyy = String(year);
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange?.(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  }

  const display = formatDisplayDate(value);

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel ?? label ?? "Pick date"}
        className="w-full min-w-0 px-3 py-2 flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-sm text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none cursor-pointer hover:border-[var(--border-active)] transition-[var(--transition)]"
      >
        <Calendar className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        <span className={display ? "" : "text-[var(--text-muted)]"}>{display || placeholder}</span>
      </button>
      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Calendar"
          className="absolute left-0 z-50 mt-1 p-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg min-w-[280px]"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer"
              aria-label="Previous month"
            >
              <span className="text-sm font-medium">‹</span>
            </button>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer"
              aria-label="Next month"
            >
              <span className="text-sm font-medium">›</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-[var(--text-muted)] mb-2">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              if (d === null) return <div key={`pad-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isSelected = value === dateStr;
              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === d;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`w-8 h-8 rounded text-sm cursor-pointer transition-[var(--transition)] ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : isToday
                        ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
