import type React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
}

export function StatCard({ label, value, icon: Icon, className = "", valueClassName = "" }: StatCardProps) {
  return (
    <Card hover className={className}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text-secondary)] mb-1.5 truncate">
              {label}
            </p>
            <p
              className={`text-xl sm:text-2xl font-semibold text-[var(--text-primary)] truncate ${valueClassName}`}
              title={typeof value === "string" || typeof value === "number" ? String(value) : undefined}
            >
              {value}
            </p>
          </div>
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f0fdfa] text-[var(--accent)]">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
