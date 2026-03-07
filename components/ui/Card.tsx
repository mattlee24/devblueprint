import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

export function Card({
  children,
  className = "",
  hover = false,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={`rounded-xl border border-neutral-200 bg-white shadow-sm transition-[box-shadow] duration-[var(--transition)] ${hover ? "card-elevation-hover" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function CardHeader({
  title,
  icon: Icon,
  action,
  className = "",
  titleClassName = "",
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h3 className={`text-sm font-semibold text-[var(--text-primary)] truncate ${titleClassName}`}>
          {title}
        </h3>
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
