"use client";

import Link from "next/link";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { TaskWithProject } from "@/lib/queries/tasks";
import type { InvoiceRow } from "@/lib/queries/invoices";
import { StatCard } from "./StatCard";
import { RecentProjects } from "./RecentProjects";
import { RecentTimeLogs } from "./RecentTimeLogs";
import { Card, CardContent } from "@/components/ui/Card";
import { DataCard } from "@/components/ui/DataCard";
import { FolderKanban, Users, Clock, Banknote, Calendar, UserCheck } from "lucide-react";
import { formatCurrency, formatHoursShort } from "@/lib/utils";

export interface DashboardData {
  clients: ClientRow[];
  projects: ProjectRow[];
  timeLogs: TimeLogRow[];
  upcomingTasks: TaskWithProject[];
  invoices?: InvoiceRow[];
  currency?: string;
  hoursThisMonth?: number;
  unbilledAmount?: number;
}

interface DashboardFixedProps {
  data: DashboardData;
}

export function DashboardFixed({ data }: DashboardFixedProps) {
  const activeProjects = data.projects.filter((p) => p.status === "active");
  const activeClients = data.clients.filter((c) => c.status === "active");
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthLogs = data.timeLogs.filter((l) => l.logged_date >= thisMonthStart);
  const hoursThisMonth = data.hoursThisMonth ?? thisMonthLogs.reduce((s, l) => s + l.hours, 0);
  const unbilled = thisMonthLogs.filter((l) => l.billable && l.invoice_id == null);
  const unbilledAmount = data.unbilledAmount ?? unbilled.reduce((s, l) => s + (l.hourly_rate ?? 0) * l.hours, 0);
  const currency = data.currency ?? activeClients[0]?.currency ?? "GBP";

  return (
    <div className="space-y-6">
      {/* Welcome / overview */}
      <Card>
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Here’s a quick summary of your active work and recent activity.
          </p>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active projects" value={activeProjects.length} icon={FolderKanban} />
        <StatCard label="Active clients" value={activeClients.length} icon={Users} />
        <StatCard label="Hours this month" value={formatHoursShort(hoursThisMonth)} icon={Clock} />
        <StatCard label="Unbilled amount" value={formatCurrency(unbilledAmount, currency)} icon={Banknote} />
      </div>

      {/* Main grid: 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataCard title="Recent projects" icon={FolderKanban}>
          <RecentProjects projects={data.projects} maxItems={5} hideHeader />
        </DataCard>

        <DataCard title="Recent time logs" icon={Clock}>
          <RecentTimeLogs logs={data.timeLogs} maxItems={6} hideHeader />
        </DataCard>

        <DataCard title="Client activity" icon={UserCheck}>
          <div className="flex flex-col min-h-0">
            {activeClients.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm py-2">No active clients.</p>
            ) : (
              <ul className="space-y-2">
                {activeClients.slice(0, 6).map((c) => {
                  const clientLogs = thisMonthLogs.filter((l) => l.client_id === c.id);
                  const h = clientLogs.reduce((s, l) => s + l.hours, 0);
                  const maxH = Math.max(1, ...activeClients.map((x) => thisMonthLogs.filter((l) => l.client_id === x.id).reduce((s, l) => s + l.hours, 0)));
                  const pct = (h / maxH) * 100;
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 py-2 px-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
                    >
                      <div
                        className="w-2 h-6 rounded-sm shrink-0"
                        style={{ backgroundColor: c.avatar_colour ?? "var(--border)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{c.name}</p>
                        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-sm text-[var(--text-secondary)] shrink-0 tabular-nums">{formatHoursShort(h)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link href="/clients" className="inline-flex items-center gap-2 mt-2 text-sm text-[var(--accent)] hover:underline cursor-pointer">
              View all clients
            </Link>
          </div>
        </DataCard>

        <DataCard title="Upcoming tasks" icon={Calendar}>
          <div className="flex flex-col min-h-0">
            {data.upcomingTasks.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm py-2">No upcoming tasks.</p>
            ) : (
              <ul className="space-y-1">
                {data.upcomingTasks.slice(0, 6).map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/projects/${task.project_id}`}
                      className="flex items-center gap-2 py-2.5 px-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-[var(--transition)] group cursor-pointer"
                    >
                      <span className="flex h-4 w-4 shrink-0 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-colors" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--accent)]">{task.title}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {task.projects?.title ?? "Project"} · {task.status.replace("_", " ")}
                        </p>
                      </div>
                      {(task as { category?: string }).category && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                          {(task as { category: string }).category}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/projects" className="inline-flex items-center gap-2 mt-2 text-sm text-[var(--accent)] hover:underline cursor-pointer">
              View all projects
            </Link>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
