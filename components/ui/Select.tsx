"use client";

import { useRef, useEffect, useState, useId } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onBlur?: () => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Select({
  label,
  options,
  placeholder,
  value = "",
  onChange,
  onBlur,
  error,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder ?? "";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onBlur]);

  function handleSelect(opt: SelectOption) {
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent, trigger: boolean) {
    if (trigger) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      let next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
      if (next < 0) next = options.length - 1;
      if (next >= options.length) next = 0;
      const opt = options[next];
      if (opt) onChange?.({ target: { value: opt.value } });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel ?? label}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => handleKeyDown(e, !open)}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full px-3 py-2 min-h-[40px] flex items-center justify-between gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-left text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)] cursor-pointer ${error ? "border-[var(--accent-red)]" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--border-active)]"}`}
      >
        <span className={!selectedOption ? "text-[var(--text-muted)]" : ""}>
          {displayLabel || " "}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 min-w-full overflow-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] py-1 shadow-lg"
          onKeyDown={(e) => handleKeyDown(e, false)}
        >
          {placeholder && !options.some((o) => o.value === "") && (
            <li
              role="option"
              aria-selected={value === ""}
              onClick={() => handleSelect({ value: "", label: placeholder })}
              className={`px-3 py-2 cursor-pointer text-sm ${value === "" ? "bg-[var(--bg-hover)] text-[var(--accent-green)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => handleSelect(opt)}
              className={`px-3 py-2 cursor-pointer text-sm ${value === opt.value ? "bg-[var(--bg-hover)] text-[var(--accent-green)]" : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-1 text-sm text-[var(--accent-red)]">{error}</p>
      )}
    </div>
  );
}
