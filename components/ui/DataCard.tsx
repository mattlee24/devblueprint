import { type ReactNode } from "react";
import { Card, CardHeader, CardContent } from "./Card";

interface DataCardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card with title, optional icon, and body (e.g. list of recent items). */
export function DataCard({
  title,
  icon,
  action,
  children,
  className = "",
}: DataCardProps) {
  return (
    <Card hover className={className}>
      <CardHeader title={title} icon={icon} action={action} className="mb-4"/>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
