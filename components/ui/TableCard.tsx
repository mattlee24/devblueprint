import { type ReactNode } from "react";
import { Card, CardHeader } from "./Card";

interface TableCardProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card that wraps a table with optional header. */
export function TableCard({
  title,
  icon,
  action,
  children,
  className = "",
}: TableCardProps) {
  const showHeader = title != null || action != null;
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader title={title ?? ""} icon={icon} action={action} />
      )}
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}
