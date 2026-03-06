"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import GridLayout, { type Layout, noCompactor } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import type { DashboardLayoutItem } from "@/lib/queries/dashboardLayouts";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { TaskWithProject } from "@/lib/queries/tasks";
import type { InvoiceRow } from "@/lib/queries/invoices";
import { StatCard } from "./StatCard";
import { RecentProjects } from "./RecentProjects";
import { RecentTimeLogs } from "./RecentTimeLogs";
import { FolderKanban, Users, Clock, Banknote, UserCheck, Calendar, ChevronRight, MoreVertical, StickyNote } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatHoursShort, formatDate } from "@/lib/utils";
import { TerminalSectionHeader } from "@/components/ui/Terminal";

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

interface DashboardGridProps {
  layout: DashboardLayoutItem[];
  onLayoutChange: (items: DashboardLayoutItem[]) => void;
  onRemoveWidget?: (id: string) => void;
  data: DashboardData;
  isCustomizing?: boolean;
}

function toRGLayout(items: DashboardLayoutItem[]): Layout {
  return items.map((it) => ({
    i: it.id,
    x: it.x,
    y: it.y,
    w: it.w,
    h: it.h,
  }));
}

function mergeLayout(
  items: DashboardLayoutItem[],
  rglLayout: Layout
): DashboardLayoutItem[] {
  const byId = new Map(items.map((it) => [it.id, { ...it }]));
  rglLayout.forEach((lg) => {
    const existing = byId.get(lg.i);
    if (existing) {
      existing.x = lg.x;
      existing.y = lg.y;
      existing.w = lg.w;
      existing.h = lg.h;
    }
  });
  return Array.from(byId.values());
}

export function DashboardGrid({
  layout,
  onLayoutChange,
  onRemoveWidget,
  data,
  isCustomizing = false,
}: DashboardGridProps) {
  const [noteContents, setNoteContents] = useState<Record<string, string>>({});
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const handleLayoutChange = useCallback(
    (rglLayout: Layout) => {
      const next = mergeLayout(layout, rglLayout);
      onLayoutChange(next);
    },
    [layout, onLayoutChange]
  );

  const renderWidget = (item: DashboardLayoutItem) => {
    const wrap = (content: React.ReactNode) => (
      <div className={`h-full flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] ${!isCustomizing ? "card-hover shadow-soft bg-[var(--bg-surface)]" : "bg-[var(--bg-surface)]"}`} style={!isCustomizing ? { background: "var(--gradient-card)" } : undefined}>
        {isCustomizing && onRemoveWidget && (
          <div className="flex justify-end p-1 border-b border-[var(--border)]">
            <button
              type="button"
              onClick={() => onRemoveWidget(item.id)}
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"
              aria-label="Remove widget"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto p-4">{content}</div>
      </div>
    );

    const activeProjects = data.projects.filter((p) => p.status === "active");
    const activeClients = data.clients.filter((c) => c.status === "active");
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const thisMonthLogs = data.timeLogs.filter((l) => l.logged_date >= thisMonthStart);
    const hoursThisMonth = data.hoursThisMonth ?? thisMonthLogs.reduce((s, l) => s + l.hours, 0);
    const unbilled = thisMonthLogs.filter((l) => l.billable && l.invoice_id == null);
    const unbilledAmount = data.unbilledAmount ?? unbilled.reduce((s, l) => s + (l.hourly_rate ?? 0) * l.hours, 0);
    const currency = data.currency ?? activeClients[0]?.currency ?? "GBP";

    switch (item.type) {
      case "stat":
        if (item.widgetKey === "active-projects")
          return wrap(<StatCard label="Active projects" value={activeProjects.length} icon={FolderKanban} />);
        if (item.widgetKey === "active-clients")
          return wrap(<StatCard label="Active clients" value={activeClients.length} icon={Users} />);
        if (item.widgetKey === "hours-month")
          return wrap(<StatCard label="Hours this month" value={formatHoursShort(hoursThisMonth)} icon={Clock} />);
        if (item.widgetKey === "unbilled")
          return wrap(<StatCard label="Unbilled amount" value={formatCurrency(unbilledAmount, currency)} icon={Banknote} />);
        return wrap(<StatCard label="Stat" value="—" />);
      case "recent-projects":
        return wrap(<RecentProjects projects={data.projects} />);
      case "recent-time-logs":
        return wrap(<RecentTimeLogs logs={data.timeLogs} />);
      case "upcoming-tasks":
        return wrap(
          <div>
            <TerminalSectionHeader>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                Upcoming
              </span>
            </TerminalSectionHeader>
            {data.upcomingTasks.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No upcoming tasks.</p>
            ) : (
              <ul className="space-y-2">
                {data.upcomingTasks.slice(0, 10).map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/projects/${task.project_id}`}
                      className="flex items-start gap-2 py-2 px-2 rounded hover:bg-[var(--bg-hover)] transition-[var(--transition)] group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--accent)]">{task.title}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {task.projects?.title ?? "Project"} · {task.status.replace("_", " ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {data.upcomingTasks.length > 10 && (
              <Link href="/projects" className="inline-flex items-center gap-2 mt-2 text-xs text-[var(--accent)] hover:underline cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" /> View all projects
              </Link>
            )}
          </div>
        );
      case "client-activity":
        return wrap(
          <div>
            <TerminalSectionHeader>
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0" />
                Client activity
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
                      <div className="w-2 h-6 rounded-sm shrink-0" style={{ backgroundColor: c.avatar_colour ?? "var(--border)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{c.name}</p>
                        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] shrink-0">{formatHoursShort(h)}h</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      case "note": {
        const content = noteContents[item.id] ?? item.content ?? "";
        return wrap(
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[var(--text-primary)]">
              <StickyNote className="w-4 h-4 text-[var(--text-muted)]" />
              Note
            </div>
            <textarea
              value={content}
              onChange={(e) => setNoteContents((prev) => ({ ...prev, [item.id]: e.target.value }))}
              onBlur={() => {
                const value = noteContents[item.id] ?? item.content ?? "";
                onLayoutChange(layout.map((it) => (it.id === item.id ? { ...it, content: value } : it)));
              }}
              placeholder="Add a note…"
              className="flex-1 min-h-[80px] w-full resize-none bg-transparent border-0 focus:outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        );
      }
      default:
        return wrap(<div className="text-[var(--text-muted)] text-sm">Unknown widget</div>);
    }
  };

  const rglLayout = toRGLayout(layout);

  return (
    <div ref={containerRef} className="w-full">
    <GridLayout
      className="layout"
      layout={rglLayout}
      onLayoutChange={handleLayoutChange}
      width={width}
      gridConfig={{ cols: 24, rowHeight: 40 }}
      compactor={noCompactor}
      dragConfig={{ enabled: isCustomizing, handle: isCustomizing ? undefined : ".no-drag" }}
      resizeConfig={{ enabled: isCustomizing }}
    >
      {layout.map((item) => (
        <div key={item.id} className={isCustomizing ? "" : "no-drag"}>
          {renderWidget(item)}
        </div>
      ))}
    </GridLayout>
    </div>
  );
}
