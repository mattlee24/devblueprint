import type { DashboardLayoutItem } from "@/lib/queries/dashboardLayouts";

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
  { id: "stat-active-projects", type: "stat", widgetKey: "active-projects", x: 0, y: 0, w: 3, h: 1 },
  { id: "stat-active-clients", type: "stat", widgetKey: "active-clients", x: 3, y: 0, w: 3, h: 1 },
  { id: "stat-hours-month", type: "stat", widgetKey: "hours-month", x: 6, y: 0, w: 3, h: 1 },
  { id: "stat-unbilled", type: "stat", widgetKey: "unbilled", x: 9, y: 0, w: 3, h: 1 },
  { id: "recent-projects", type: "recent-projects", x: 0, y: 1, w: 6, h: 2 },
  { id: "recent-time-logs", type: "recent-time-logs", x: 6, y: 1, w: 6, h: 2 },
  { id: "client-activity", type: "client-activity", x: 0, y: 3, w: 6, h: 2 },
  { id: "upcoming-tasks", type: "upcoming-tasks", x: 6, y: 3, w: 6, h: 2 },
];
