import Link from "next/link";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import { WidgetSectionHeader } from "@/components/ui/Terminal";
import { formatDate, formatHoursShort, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";

interface RecentTimeLogsProps {
  logs: TimeLogRow[];
  maxItems?: number;
  /** When true, the card title is rendered by the parent (e.g. DataCard). */
  hideHeader?: boolean;
}

export function RecentTimeLogs({ logs, maxItems = 8, hideHeader }: RecentTimeLogsProps) {
  const list = logs.slice(0, maxItems);
  return (
    <div className="flex flex-col min-h-0">
      {!hideHeader && (
        <WidgetSectionHeader>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-[var(--accent)]" />
            Recent time logs
          </span>
        </WidgetSectionHeader>
      )}
      {list.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 opacity-50" />
          No time entries yet.
        </p>
      ) : (
        <ul className="space-y-1 flex-1 min-h-0 overflow-hidden">
          {list.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-[var(--transition)] text-sm"
            >
              <div className="min-w-0">
                <p className="truncate">{log.description}</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  {formatDate(log.logged_date)}
                  {" · "}
                  {(log as unknown as { clients?: { name: string } })?.clients?.name ?? "—"}
                  {" · "}
                  {(log as unknown as { projects?: { title: string } })?.projects?.title ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={log.billable ? "teal" : "muted"}>
                  {log.billable ? "Billable" : "Non-billable"}
                </Badge>
                <span className="text-[var(--accent-green)]">{formatHoursShort(log.hours)}</span>
                {log.hourly_rate != null && log.billable && (
                  <span className="text-[var(--text-secondary)]">
                    {formatCurrency(log.hours * log.hourly_rate, log.currency)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/time-logs"
        className="inline-flex items-center gap-2 mt-2 text-sm text-[var(--accent)] hover:underline cursor-pointer shrink-0"
      >
        View all
      </Link>
    </div>
  );
}
