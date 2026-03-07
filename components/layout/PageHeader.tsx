import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  icon: Icon,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6 ${className}`}
    >
      <div className="min-w-0">
        <h1
          className="text-[var(--page-title-size)] font-semibold text-[var(--text-primary)] flex items-center gap-3"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: "var(--line-height-tight)" }}
        >
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] text-[var(--accent)]">
              <Icon className="h-5 w-5" />
            </span>
          )}
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action != null && <div className="shrink-0 mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}
