"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />}
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
