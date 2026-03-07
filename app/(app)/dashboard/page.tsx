"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getUpcomingTasks } from "@/lib/queries/tasks";
import { getDashboardLayout, upsertDashboardLayout, type DashboardLayoutItem } from "@/lib/queries/dashboardLayouts";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboardDefaultLayout";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { TaskWithProject } from "@/lib/queries/tasks";
import { FolderKanban, LayoutGrid, Plus } from "lucide-react";
import { DashboardGrid, type DashboardData } from "@/components/dashboard/DashboardGrid";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

const WIDGET_CATALOG: { type: string; widgetKey?: string; label: string; w: number; h: number }[] = [
  { type: "stat", widgetKey: "active-projects", label: "Active projects", w: 6, h: 2 },
  { type: "stat", widgetKey: "active-clients", label: "Active clients", w: 6, h: 2 },
  { type: "stat", widgetKey: "hours-month", label: "Hours this month", w: 6, h: 2 },
  { type: "stat", widgetKey: "unbilled", label: "Unbilled amount", w: 6, h: 2 },
  { type: "recent-projects", label: "Recent projects", w: 12, h: 4 },
  { type: "recent-time-logs", label: "Recent time logs", w: 12, h: 4 },
  { type: "upcoming-tasks", label: "Upcoming tasks", w: 12, h: 4 },
  { type: "client-activity", label: "Client activity", w: 12, h: 4 },
  { type: "note", label: "Note", w: 8, h: 4 },
];

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithProject[]>([]);
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

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

  useEffect(() => {
    if (!userId) return;
    getDashboardLayout(userId).then(({ data, error: err }) => {
      if (err) return;
      if (data?.items?.length) setLayout(data.items);
      setLayoutLoaded(true);
    });
  }, [userId]);

  const persistLayout = useCallback(
    (next: DashboardLayoutItem[]) => {
      if (!userId) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        upsertDashboardLayout(userId, { items: next }).then(({ error: err }) => {
          if (err) toast.error("Failed to save dashboard layout");
        });
        saveTimeoutRef.current = null;
      }, 500);
    },
    [userId]
  );

  const handleLayoutChange = useCallback(
    (next: DashboardLayoutItem[]) => {
      setLayout(next);
      persistLayout(next);
    },
    [persistLayout]
  );

  const handleRemoveWidget = useCallback(
    (id: string) => {
      const next = layout.filter((it) => it.id !== id);
      setLayout(next);
      persistLayout(next);
    },
    [layout, persistLayout]
  );

  const handleAddWidget = useCallback(
    (type: string, widgetKey?: string, w = 6, h = 2) => {
      const catalogItem = WIDGET_CATALOG.find((c) => c.type === type && c.widgetKey === widgetKey) || { w: 6, h: 2 };
      const maxY = layout.length === 0 ? 0 : Math.max(...layout.map((it) => it.y + it.h));
      const id = type === "note" ? `note-${Date.now()}` : `${type}${widgetKey ? `-${widgetKey}` : ""}-${Date.now()}`;
      const newItem: DashboardLayoutItem = {
        id,
        type,
        x: 0,
        y: maxY,
        w: catalogItem.w,
        h: catalogItem.h,
      };
      if (widgetKey) newItem.widgetKey = widgetKey;
      if (type === "note") newItem.content = "";
      const next = [...layout, newItem];
      setLayout(next);
      persistLayout(next);
      setAddWidgetOpen(false);
    },
    [layout, persistLayout]
  );

  const activeProjects = projects.filter((p) => p.status === "active");
  const activeClients = clients.filter((c) => c.status === "active");
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthLogs = timeLogs.filter((l) => l.logged_date >= thisMonthStart);
  const hoursThisMonth = thisMonthLogs.reduce((s, l) => s + l.hours, 0);
  const unbilled = thisMonthLogs.filter((l) => l.billable && l.invoice_id == null);
  const unbilledAmount = unbilled.reduce((s, l) => s + (l.hourly_rate ?? 0) * l.hours, 0);
  const currency = activeClients[0]?.currency ?? "GBP";

  const dashboardData: DashboardData = {
    clients,
    projects,
    timeLogs,
    upcomingTasks,
    currency,
    hoursThisMonth,
    unbilledAmount,
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-[var(--accent-red)]">Something went wrong. {error} Retry?</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div
        className="rounded-[var(--radius-card)] p-8 mb-6 border border-[var(--border-subtle)] shadow-card"
        style={{ background: "var(--page-dashboard)" }}
      >
        <h1 className="text-2xl font-semibold flex items-center gap-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          <span className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--accent)]/20 text-[var(--accent)]">
            <FolderKanban className="w-6 h-6" />
          </span>
          Dashboard
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Your workspace at a glance. Customize widgets and rearrange your layout.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="w-0 h-0 overflow-hidden" aria-hidden>
          <span>Dashboard actions</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsCustomizing((c) => !c)}
            className="cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
          {isCustomizing && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setLayout([...DEFAULT_DASHBOARD_LAYOUT]);
                  persistLayout(DEFAULT_DASHBOARD_LAYOUT);
                  toast.success("Dashboard reset to default");
                }}
                className="cursor-pointer"
              >
                Reset to default
              </Button>
              <Button onClick={() => setAddWidgetOpen(true)} className="cursor-pointer">
                <Plus className="w-4 h-4 shrink-0" />
                Add widget
              </Button>
            </>
          )}
        </div>
      </div>

      {!layoutLoaded ? (
        <div className="animate-pulse text-[var(--text-muted)]">Loading layout…</div>
      ) : (
        <DashboardGrid
          layout={layout}
          onLayoutChange={handleLayoutChange}
          onRemoveWidget={isCustomizing ? handleRemoveWidget : undefined}
          data={dashboardData}
          isCustomizing={isCustomizing}
        />
      )}

      <Modal
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        title="Add widget"
        contentClassName="max-w-md"
      >
        <ul className="space-y-1">
          {WIDGET_CATALOG.map((w) => {
            const key = w.widgetKey ? `${w.type}-${w.widgetKey}` : w.type;
            const alreadyAdded =
              w.type !== "note" &&
              layout.some((it) => (it.widgetKey ? `${it.type}-${it.widgetKey}` : it.type) === key);
            return (
              <li key={key}>
                <button
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => !alreadyAdded && handleAddWidget(w.type, w.widgetKey, w.w, w.h)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[var(--text-primary)]"
                >
                  {w.label}
                  {alreadyAdded && " (added)"}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </main>
  );
}
