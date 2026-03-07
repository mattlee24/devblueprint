"use client";

import { useEffect, useState } from "react";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getUpcomingTasks } from "@/lib/queries/tasks";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { TaskWithProject } from "@/lib/queries/tasks";
import { LayoutDashboard } from "lucide-react";
import { DashboardFixed, type DashboardData } from "@/components/dashboard/DashboardFixed";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

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

  const activeClients = clients.filter((c) => c.status === "active");
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthLogs = timeLogs.filter((l) => l.logged_date >= thisMonthStart);
  const hoursThisMonth = thisMonthLogs.reduce((s, l) => s + l.hours, 0);
  const unbilled = thisMonthLogs.filter((l) => l.billable && l.invoice_id == null);
  const unbilledAmount = unbilled.reduce((s, l) => s + (l.hourly_rate ?? 0) * l.hours, 0);

  const dashboardData: DashboardData = {
    clients,
    projects,
    timeLogs,
    upcomingTasks,
    currency: activeClients[0]?.currency ?? "GBP",
    hoursThisMonth,
    unbilledAmount,
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse text-[var(--text-muted)]">Loading…</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <p className="text-[var(--accent-red)]">Something went wrong. {error}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your workspace at a glance."
        icon={LayoutDashboard}
      />
      <DashboardFixed data={dashboardData} />
    </PageContainer>
  );
}
