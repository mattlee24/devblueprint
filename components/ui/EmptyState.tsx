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
      className={`flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] ${className}`}
    >
      {Icon && (
        <div className="mb-3 p-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <p className="text-[var(--text-secondary)] text-sm mb-1">{"> "}{title}</p>
      {description && (
        <p className="text-[var(--text-muted)] text-xs mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
