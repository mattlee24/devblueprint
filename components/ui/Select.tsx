"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Radix Select does not allow value="". Use this sentinel for empty option. */
const EMPTY_SELECT_VALUE = "__empty__";

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
  /** When false, trigger is w-auto min-w-[140px] for compact use in modals/filters. */
  fullWidth?: boolean;
  /** Optional leading element (e.g. coloured dot for Priority) shown before the value. */
  leading?: ReactNode;
  /** Optional class for the trigger (e.g. pill styling in Task Detail). */
  triggerClassName?: string;
}

function toRadixValue(v: string, hasEmptyOption: boolean): string | undefined {
  if (v === "") return hasEmptyOption ? EMPTY_SELECT_VALUE : undefined;
  return v;
}

function fromRadixValue(v: string | undefined): string {
  if (v === undefined || v === EMPTY_SELECT_VALUE) return "";
  return v;
}

export function Select({
  label,
  options,
  placeholder = "Select…",
  value = "",
  onChange,
  onBlur,
  error,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
  fullWidth = true,
  leading,
  triggerClassName,
}: SelectProps) {
  const hasEmptyOption = options.some((o) => o.value === "");
  const triggerClasses = `min-h-[40px] flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm text-neutral-900 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-0 focus:border-transparent ${fullWidth ? "w-full" : "w-auto min-w-[140px]"} ${error ? "border-red-500" : "border-neutral-200"} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-50"} ${triggerClassName ?? ""}`.trim();
  return (
    <div className={`relative ${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={toRadixValue(value, hasEmptyOption)}
        onValueChange={(v) => onChange?.({ target: { value: fromRadixValue(v) } })}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel ?? label}
          className={triggerClasses}
        >
          {leading != null && <span className="shrink-0">{leading}</span>}
          <SelectPrimitive.Value placeholder={placeholder} className="flex-1 min-w-0" />
          <SelectPrimitive.Icon>
            <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[160px] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
          >
            <SelectPrimitive.Viewport>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value === "" ? EMPTY_SELECT_VALUE : opt.value}
                  value={opt.value === "" ? EMPTY_SELECT_VALUE : opt.value}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm outline-none data-[highlighted]:bg-neutral-50 data-[state=checked]:bg-neutral-50 data-[state=checked]:text-teal-600"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className="mt-1 text-sm text-[var(--accent-red)]">{error}</p>
      )}
    </div>
  );
}
