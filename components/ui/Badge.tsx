import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-[var(--border)] text-[var(--text-primary)]",
  success: "border-[var(--accent)] text-[var(--accent)]",
  warning: "border-[var(--accent-amber)] text-[var(--accent-amber)]",
  danger: "border-[var(--accent-red)] text-[var(--accent-red)]",
  muted: "border-[var(--text-muted)] text-[var(--text-muted)]",
  purple: "border-[var(--accent-purple)] text-[var(--accent-purple)]",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] border text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
