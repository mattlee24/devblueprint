import { type ReactNode } from "react";

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

/** Small section label above a card or list; muted, consistent spacing. */
export function SectionHeader({ children, className = "" }: SectionHeaderProps) {
  return (
    <h2
      className={`text-[var(--section-label-size)] font-medium uppercase tracking-[var(--section-label-tracking)] text-[var(--text-muted)] mb-3 ${className}`}
    >
      {children}
    </h2>
  );
}
