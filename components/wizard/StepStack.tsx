"use client";

import { getStackGroups } from "@/lib/stackOptions";
import type { ProjectType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface StepStackProps {
  type: ProjectType;
  selected: string[];
  onToggle: (value: string) => void;
}

export function StepStack({ type, selected, onToggle }: StepStackProps) {
  const groups = getStackGroups(type);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--text-secondary)]">
        Select one or more technologies. Selected: {selected.length}
      </p>
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2 border-b border-[var(--border)] pb-1">
            —— {group.label} ——
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {group.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onToggle(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm transition-[var(--transition)] ${
                    isSelected
                      ? "border-[var(--accent-green)] bg-[var(--bg-hover)] text-[var(--accent-green)]"
                      : "border-[var(--border)] hover:border-[var(--border-active)] text-[var(--text-secondary)]"
                  }`}
                >
                  {isSelected ? "◉" : "◯"} {opt.label}
                  {opt.recommended && (
                    <Badge variant="success" className="ml-1 text-[10px]">
                      RECOMMENDED
                    </Badge>
                  )}
                  {opt.upcoming && (
                    <Badge variant="warning" className="ml-1 text-[10px]">
                      UP AND COMING
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {selected.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className="cursor-pointer"
            >
              <Badge variant="default">{s} ×</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
