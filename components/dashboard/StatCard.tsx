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
      className={`border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)] hover:border-[var(--border-active)] hover:shadow-[0_0_10px_rgba(0,255,136,0.1)] transition-[var(--transition)] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent-green)]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
