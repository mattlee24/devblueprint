"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getUpcomingTasks } from "@/lib/queries/tasks";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { TaskWithProject } from "@/lib/queries/tasks";
import { FolderKanban, Users, Clock, Banknote, UserCheck, Calendar, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { RecentTimeLogs } from "@/components/dashboard/RecentTimeLogs";
import { TerminalSectionHeader } from "@/components/ui/Terminal";
import { formatCurrency, formatHoursShort } from "@/lib/utils";

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [cRes, pRes, tRes, uRes] = await Promise.all([
        getClients(),
        getProjects(),
        getTimeLogs(),
        getUpcomingTasks(15),
      ]);
      if (cRes.error) setError(cRes.error.message);
      else setClients(cRes.data ?? []);
      if (pRes.error && !cRes.error) setError(pRes.error.message);
      else setProjects(pRes.data ?? []);
      if (tRes.error && !cRes.error && !pRes.error) setError(tRes.error.message);
      else setTimeLogs(tRes.data ?? []);
      if (uRes.error && !cRes.error && !pRes.error && !tRes.error) setError(uRes.error.message);
      else setUpcomingTasks(uRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active");
  const activeClients = clients.filter((c) => c.status === "active");
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthLogs = timeLogs.filter((l) => l.logged_date >= thisMonthStart);
  const hoursThisMonth = thisMonthLogs.reduce((s, l) => s + l.hours, 0);
  const unbilled = thisMonthLogs.filter((l) => l.billable && l.invoice_id == null);
  const unbilledAmount = unbilled.reduce(
    (s, l) => s + (l.hourly_rate ?? 0) * l.hours,
    0
  );
  const currency = activeClients[0]?.currency ?? "GBP";

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">░░░░░░░░░░ Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-[var(--accent-red)]">{"> ERROR: "}{error} Retry?</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <FolderKanban className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Projects" value={activeProjects.length} icon={FolderKanban} />
        <StatCard label="Active Clients" value={activeClients.length} icon={Users} />
        <StatCard label="Hours This Month" value={formatHoursShort(hoursThisMonth)} icon={Clock} />
        <StatCard
          label="Unbilled Amount"
          value={formatCurrency(unbilledAmount, currency)}
          icon={Banknote}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects projects={projects} />
        <RecentTimeLogs logs={timeLogs} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)]">
          <TerminalSectionHeader>
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              CLIENT ACTIVITY
            </span>
          </TerminalSectionHeader>
          {activeClients.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No active clients.</p>
          ) : (
            <ul className="space-y-2">
              {activeClients.slice(0, 5).map((c) => {
                const clientLogs = thisMonthLogs.filter((l) => l.client_id === c.id);
                const h = clientLogs.reduce((s, l) => s + l.hours, 0);
                const maxH = Math.max(1, ...activeClients.map((x) => thisMonthLogs.filter((l) => l.client_id === x.id).reduce((s, l) => s + l.hours, 0)));
                const pct = (h / maxH) * 100;
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <div
                      className="w-2 h-6 rounded-sm shrink-0"
                      style={{ backgroundColor: c.avatar_colour ?? "var(--border)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{c.name}</p>
                      <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[var(--accent-green)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] shrink-0">
                      {formatHoursShort(h)}h
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)]">
          <TerminalSectionHeader>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              UPCOMING
            </span>
          </TerminalSectionHeader>
          {upcomingTasks.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No upcoming tasks. Add tasks on a project board.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.slice(0, 10).map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/projects/${task.project_id}`}
                    data-context-menu="project"
                    data-context-id={task.project_id}
                    className="flex items-start gap-2 py-2 px-2 rounded hover:bg-[var(--bg-hover)] transition-[var(--transition)] group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-green)]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {task.projects?.title ?? "Project"} · {task.status.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {upcomingTasks.length > 10 && (
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 mt-2 text-xs text-[var(--accent-blue)] hover:underline"
            >
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              View all projects
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
