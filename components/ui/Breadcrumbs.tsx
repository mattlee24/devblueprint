"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-[var(--text-muted)] px-0.5">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-[var(--transition)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
