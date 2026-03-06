import Link from "next/link";
import type { ClientRow } from "@/lib/queries/clients";
import { Badge } from "@/components/ui/Badge";
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
      className="cursor-pointer"
    >
      <article className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 card-gradient card-hover transition-[var(--transition)] group">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium shrink-0 border-2 border-[var(--border)]"
            style={{ backgroundColor: client.avatar_colour ?? "var(--bg-elevated)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold group-hover:text-[var(--accent)]">
              {client.name}
            </h3>
            {client.company && (
              <p className="text-sm text-[var(--text-secondary)]">{client.company}</p>
            )}
            {client.email && (
              <p className="text-xs text-[var(--text-muted)] truncate">{client.email}</p>
            )}
            <div className="flex gap-2 mt-2">
              <Badge variant="default">{client.status.replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-[var(--text-muted)]">
              <span>{projectCount} projects</span>
              <span>{hoursLogged.toFixed(1)}h logged</span>
              <span>{formatCurrency(amountBilled, currency)} billed</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-[var(--accent)] mt-2 group-hover:underline inline-flex items-center gap-2">
          <ArrowRight className="w-4 h-4 shrink-0" />
          View
        </p>
      </article>
    </Link>
  );
}
