import { type ReactNode } from "react";

interface ActivityListProps {
  children: ReactNode;
  className?: string;
}

export function ActivityList({ children, className = "" }: ActivityListProps) {
  return (
    <ul className={`divide-y divide-[var(--border-subtle)] ${className}`}>
      {children}
    </ul>
  );
}

interface ActivityListItemProps {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ActivityListItem({
  icon,
  children,
  className = "",
}: ActivityListItemProps) {
  return (
    <li
      className={`flex items-start gap-3 px-4 py-3 text-sm transition-[background] duration-[var(--transition)] hover:bg-[var(--bg-hover)] ${className}`}
    >
      {icon != null && (
        <span className="mt-0.5 shrink-0 text-[var(--text-muted)]">{icon}</span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
