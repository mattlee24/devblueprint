import Link from "next/link";
import type { ClientRow } from "@/lib/queries/clients";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ClientCardProps {
  client: ClientRow;
  projectCount?: number;
  hoursLogged?: number;
  amountBilled?: number;
  currency?: string;
}

export function ClientCard({
  client,
  projectCount = 0,
  hoursLogged = 0,
  amountBilled = 0,
  currency = "GBP",
}: ClientCardProps) {
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/clients/${client.id}`}
      data-context-menu="client"
      data-context-id={client.id}
      className="cursor-pointer block"
    >
      <Card hover className="h-full flex flex-col p-5 group">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-base font-semibold shrink-0 border-2 border-[var(--border)]"
            style={{ backgroundColor: client.avatar_colour ?? "var(--bg-elevated)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {client.name}
            </h3>
            {client.company && (
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{client.company}</p>
            )}
            {client.email && (
              <p className="text-xs text-[var(--text-muted)] truncate mt-1">{client.email}</p>
            )}
            <div className="mt-2">
              <Badge variant="default">{client.status.replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            </div>
          </div>
        </div>
        {/* Single readable metrics row */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
          <span>{projectCount} project{projectCount === 1 ? "" : "s"}</span>
          <span>{hoursLogged.toFixed(1)}h logged</span>
          <span>{formatCurrency(amountBilled, currency)} billed</span>
        </div>
        <p className="text-sm font-medium text-[var(--accent)] mt-3 group-hover:underline inline-flex items-center gap-2">
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
          View client
        </p>
      </Card>
    </Link>
  );
}
