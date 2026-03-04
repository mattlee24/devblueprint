import { type ReactNode } from "react";

interface TerminalProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Terminal({ title = "terminal", children, className = "" }: TerminalProps) {
  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
        <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
        <span className="text-xs text-[var(--text-muted)] ml-2">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm">{children}</div>
    </div>
  );
}

/** Section header in terminal style: > SECTION NAME ───── */
export function TerminalSectionHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
      <span className="text-[var(--accent-green)]">{">"}</span>
      <span>{children}</span>
      <span className="flex-1 border-b border-[var(--border)]" />
    </h2>
  );
}
