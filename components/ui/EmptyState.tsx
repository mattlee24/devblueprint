import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-soft ${className}`}
      style={{ background: "var(--gradient-card)" }}
    >
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--border-subtle)] text-[var(--accent)]">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-[var(--text-primary)] font-medium text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-[var(--text-secondary)] text-sm mb-5 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
