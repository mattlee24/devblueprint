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
      className={`relative flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "24px 24px" }} aria-hidden />
      {Icon && (
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f0fdfa] text-[var(--accent)]">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="relative text-[var(--text-primary)] font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="relative text-[var(--text-secondary)] text-sm mb-5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
