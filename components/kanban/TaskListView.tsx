"use client";

import { useState, useMemo } from "react";
import type { TaskRow } from "@/lib/queries/tasks";
import type { BoardConfig } from "@/lib/queries/projects";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/utils";
import { LayoutList, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

const PRIORITY_DOT = { p1: "bg-red-500", p2: "bg-amber-500", p3: "bg-green-500" };

const DEFAULT_COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "in_review", label: "In review" },
  { id: "done", label: "Done" },
];

type SortKey = "title" | "status" | "priority" | "due_date" | "category";

interface TaskListViewProps {
  tasks: TaskRow[];
  boardConfig: BoardConfig | null;
  onTaskClick: (task: TaskRow) => void;
  onTaskUpdate: (taskId: string, updates: Partial<TaskRow>) => Promise<void>;
  categoryOptions?: { value: string; label: string }[];
  priorityOptions?: { value: string; label: string }[];
}

export function TaskListView({
  tasks,
  boardConfig,
  onTaskClick,
  onTaskUpdate,
  categoryOptions = [
    { value: "dev", label: "Dev" },
    { value: "design", label: "Design" },
    { value: "content", label: "Content" },
    { value: "seo", label: "SEO" },
    { value: "devops", label: "DevOps" },
    { value: "testing", label: "Testing" },
    { value: "other", label: "Other" },
  ],
  priorityOptions = [
    { value: "p1", label: "P1 – High" },
    { value: "p2", label: "P2 – Medium" },
    { value: "p3", label: "P3 – Low" },
  ],
}: TaskListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const columnLabels = boardConfig?.columnLabels ?? {};
  const statusLabel = (status: string) =>
    columnLabels[status] ?? DEFAULT_COLUMNS.find((c) => c.id === status)?.label ?? status;

  const sortedTasks = useMemo(() => {
    const list = [...tasks];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "priority":
          cmp = (a.priority === "p1" ? 3 : a.priority === "p2" ? 2 : 1) - (b.priority === "p1" ? 3 : b.priority === "p2" ? 2 : 1);
          break;
        case "due_date": {
          const da = a.due_date ?? "";
          const db = b.due_date ?? "";
          cmp = da.localeCompare(db);
          break;
        }
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        default:
          cmp = 0;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [tasks, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <LayoutList className="w-4 h-4 text-neutral-500 shrink-0" />
        <span className="text-sm text-neutral-500">Sort by</span>
        {(["title", "status", "priority", "due_date", "category"] as SortKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleSort(key)}
            className="px-2 py-1 rounded text-sm border border-neutral-200 hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
          >
            {key === "due_date" ? "Due date" : key.charAt(0).toUpperCase() + key.slice(1)}
            {sortKey === key ? sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-50" />}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Title</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Priority</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Category</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Due date</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    No tasks. Add one from the Kanban view or use Add task.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-neutral-900">{task.title}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <Select
                        label=""
                        value={task.status}
                        onChange={(e) => onTaskUpdate(task.id, { status: e.target.value })}
                        options={[
                          { value: "backlog", label: "Backlog" },
                          { value: "todo", label: "To do" },
                          { value: "in_progress", label: "In progress" },
                          { value: "in_review", label: "In review" },
                          { value: "done", label: "Done" },
                        ]}
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority as keyof typeof PRIORITY_DOT] ?? "bg-neutral-400"}`} aria-hidden />
                        {priorityOptions.find((p) => p.value === task.priority)?.label ?? task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {categoryOptions.find((c) => c.value === task.category)?.label ?? task.category}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {task.due_date ? formatDate(task.due_date) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
