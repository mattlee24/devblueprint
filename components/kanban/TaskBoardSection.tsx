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
import { AddTaskModal } from "./AddTaskModal";
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
  onTaskCreate: (task: Partial<TaskRow> & { title: string }) => Promise<void>;
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

  async function handleCreateTask(payload: {
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    category: string;
    effort: string;
    due_date?: string | null;
  }) {
    await onTaskCreate({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority as TaskRow["priority"],
      category: payload.category as TaskRow["category"],
      effort: payload.effort as TaskRow["effort"],
      due_date: payload.due_date ?? null,
      position: 0,
    });
    setAddTaskOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-[var(--border)] p-1 bg-[var(--bg-elevated)]">
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

      <TaskDetailModal
        task={detailTask}
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        onSave={async (updates) => {
          if (detailTask) await onTaskUpdate(detailTask.id, updates);
        }}
        onDelete={() => {
          if (detailTask) onTaskDelete(detailTask.id);
          setDetailTask(null);
        }}
        categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
        priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
      />

      {addTaskOpen && (
        <AddTaskModal
          open={addTaskOpen}
          onClose={() => setAddTaskOpen(false)}
          defaultStatus={"todo" as TaskStatus}
          onCreate={handleCreateTask}
          categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
          priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
        />
      )}
    </div>
  );
}
