"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskRow } from "@/lib/queries/tasks";
import type { ProjectRow } from "@/lib/queries/projects";
import type { BoardConfig } from "@/lib/queries/projects";
import type { TaskStatus } from "@/lib/types";
import { KanbanBoard } from "./KanbanBoard";
import { TaskListView } from "./TaskListView";
import { TaskCalendarView } from "./TaskCalendarView";
import { TaskDetailModal } from "./TaskDetailModal";
import { Button } from "@/components/ui/Button";
import { LayoutGrid, List, Calendar } from "lucide-react";

const STORAGE_KEY_PREFIX = "task-view-";

export type TaskViewMode = "kanban" | "list" | "calendar";

interface TaskBoardSectionProps {
  projectId: string;
  project: ProjectRow;
  tasks: TaskRow[];
  onTaskUpdate: (taskId: string, updates: Partial<TaskRow>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskCreate: (task: Partial<TaskRow> & { title: string }, options?: { subtaskTitles?: string[] }) => Promise<void>;
  onBoardConfigChange?: (config: BoardConfig) => void;
}

const DEFAULT_CATEGORIES = [
  { value: "dev", label: "Dev" },
  { value: "design", label: "Design" },
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "devops", label: "DevOps" },
  { value: "testing", label: "Testing" },
  { value: "other", label: "Other" },
];

const DEFAULT_PRIORITIES = [
  { value: "p1", label: "P1 – High" },
  { value: "p2", label: "P2 – Medium" },
  { value: "p3", label: "P3 – Low" },
];

export function TaskBoardSection({
  projectId,
  project,
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  onBoardConfigChange,
}: TaskBoardSectionProps) {
  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [detailTask, setDetailTask] = useState<TaskRow | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === "list" || raw === "calendar" || raw === "kanban") setViewMode(raw);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const handleViewChange = useCallback(
    (mode: TaskViewMode) => {
      setViewMode(mode);
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const boardConfig = (project.board_config as BoardConfig | null) ?? null;
  const categories = boardConfig?.categories?.length ? boardConfig.categories : DEFAULT_CATEGORIES;
  const priorities = boardConfig?.priorities?.length ? boardConfig.priorities : DEFAULT_PRIORITIES;
  const columnOrder = boardConfig?.columnOrder?.length ? boardConfig.columnOrder : ["todo", "in_progress", "in_review", "done"];
  const columnLabels = boardConfig?.columnLabels ?? { todo: "To do", in_progress: "In progress", in_review: "In review", done: "Done" };
  const statusOptions = columnOrder.map((id) => ({ value: id, label: columnLabels[id] ?? id }));
  const defaultStatusForNewTask = (columnOrder[0] ?? "todo") as TaskStatus;

  async function handleCreateTask(
    payload: Partial<TaskRow> & { title: string },
    options?: { subtaskTitles?: string[] }
  ) {
    await onTaskCreate(
      {
        ...payload,
        description: payload.description ?? null,
        status: payload.status ?? defaultStatusForNewTask,
        priority: (payload.priority as TaskRow["priority"]) ?? "p2",
        category: (payload.category as TaskRow["category"]) ?? "dev",
        effort: (payload.effort as TaskRow["effort"]) ?? "medium",
        due_date: payload.due_date ?? null,
        position: tasks.length,
      },
      options
    );
    setAddTaskOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-[5px] border border-[var(--border)] p-1 bg-[var(--bg-elevated)]">
          <button
            type="button"
            onClick={() => handleViewChange("kanban")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-[var(--transition)] ${
              viewMode === "kanban"
                ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("list")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-[var(--transition)] ${
              viewMode === "list"
                ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("calendar")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-[var(--transition)] ${
              viewMode === "calendar"
                ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
        {viewMode !== "kanban" && (
          <Button
            variant="primary"
            onClick={() => setAddTaskOpen(true)}
            className="cursor-pointer"
          >
            Add task
          </Button>
        )}
      </div>

      {viewMode === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          boardConfig={boardConfig}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onTaskCreate={onTaskCreate}
          onBoardConfigChange={onBoardConfigChange}
          onOpenTask={setDetailTask}
          projectName={project.title}
        />
      )}
      {viewMode === "list" && (
        <TaskListView
          tasks={tasks}
          boardConfig={boardConfig}
          onTaskClick={setDetailTask}
          onTaskUpdate={onTaskUpdate}
          categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
          priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
        />
      )}
      {viewMode === "calendar" && (
        <TaskCalendarView tasks={tasks} onTaskClick={setDetailTask} />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          open={!!detailTask}
          onClose={() => setDetailTask(null)}
          onSave={async (updates) => {
            await onTaskUpdate(detailTask.id, updates);
          }}
          onDelete={() => {
            onTaskDelete(detailTask.id);
            setDetailTask(null);
          }}
          projectName={project.title}
          categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
          priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
          statusOptions={statusOptions}
        />
      )}

      {addTaskOpen && (
        <TaskDetailModal
          task={null}
          open={addTaskOpen}
          onClose={() => setAddTaskOpen(false)}
          onCreate={handleCreateTask}
          defaultStatus={defaultStatusForNewTask}
          projectName={project.title}
          categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
          priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
}
