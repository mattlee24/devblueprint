interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={className}>
      <div className="h-2 bg-[var(--bg-elevated)] rounded-[var(--radius-badge)] overflow-hidden border border-[var(--border)]">
        <div
          className="h-full bg-[var(--accent-green)] transition-[var(--transition)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {value} / {max}
        </p>
      )}
    </div>
  );
}
