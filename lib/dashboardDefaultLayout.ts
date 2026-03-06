import type { DashboardLayoutItem } from "@/lib/queries/dashboardLayouts";

/** Grid: 24 cols, rowHeight 40. Widgets use proportionally larger w/h for finer tuning. */
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
  { id: "stat-active-projects", type: "stat", widgetKey: "active-projects", x: 0, y: 0, w: 6, h: 2 },
  { id: "stat-active-clients", type: "stat", widgetKey: "active-clients", x: 6, y: 0, w: 6, h: 2 },
  { id: "stat-hours-month", type: "stat", widgetKey: "hours-month", x: 12, y: 0, w: 6, h: 2 },
  { id: "stat-unbilled", type: "stat", widgetKey: "unbilled", x: 18, y: 0, w: 6, h: 2 },
  { id: "recent-projects", type: "recent-projects", x: 0, y: 2, w: 12, h: 4 },
  { id: "recent-time-logs", type: "recent-time-logs", x: 12, y: 2, w: 12, h: 4 },
  { id: "client-activity", type: "client-activity", x: 0, y: 6, w: 12, h: 4 },
  { id: "upcoming-tasks", type: "upcoming-tasks", x: 12, y: 6, w: 12, h: 4 },
];
