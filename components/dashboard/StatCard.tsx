import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className = "" }: StatCardProps) {
  return (
    <div
      className={`border border-[var(--border)] rounded-[var(--radius-card)] p-4 card-gradient card-hover transition-[var(--transition)] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">
            {label}
          </p>
          <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent)]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
