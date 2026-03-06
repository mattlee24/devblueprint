"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { TaskRow } from "@/lib/queries/tasks";
import type { BoardConfig } from "@/lib/queries/projects";
import type { TaskStatus } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { AddTaskModal } from "./AddTaskModal";
import { BoardSettingsModal } from "./BoardSettingsModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Filter, Pencil, LayoutList, Settings } from "lucide-react";

const DEFAULT_COLUMNS: { id: string; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "in_review", label: "In review" },
  { id: "done", label: "Done" },
];

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

interface KanbanBoardProps {
  tasks: TaskRow[];
  boardConfig: BoardConfig | null;
  onTaskUpdate: (taskId: string, updates: Partial<TaskRow>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskCreate: (task: Partial<TaskRow> & { title: string }) => Promise<void>;
  onBoardConfigChange?: (config: BoardConfig) => void;
}

export function KanbanBoard({
  tasks,
  boardConfig,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  onBoardConfigChange,
}: KanbanBoardProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [detailTask, setDetailTask] = useState<TaskRow | null>(null);
  const [addTaskColumn, setAddTaskColumn] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const categories = boardConfig?.categories?.length ? boardConfig.categories : DEFAULT_CATEGORIES;
  const priorities = boardConfig?.priorities?.length ? boardConfig.priorities : DEFAULT_PRIORITIES;

  const columnOrder = boardConfig?.columnOrder ?? DEFAULT_COLUMNS.map((c) => c.id);
  const columnLabels = boardConfig?.columnLabels ?? {};
  const columns = columnOrder.map((id) => ({
    id,
    label: columnLabels[id] ?? DEFAULT_COLUMNS.find((c) => c.id === id)?.label ?? id,
  }));

  const filtered = tasks.filter((t) => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const byStatus = useCallback(
    (status: string) =>
      filtered.filter((t) => t.status === status).sort((a, b) => a.position - b.position),
    [filtered]
  );

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const newPosition = result.destination.index;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await onTaskUpdate(taskId, { status: newStatus, position: newPosition });
  }

  function handleColumnLabelSave(colId: string) {
    const value = editingLabel.trim();
    if (value && onBoardConfigChange) {
      onBoardConfigChange({
        ...boardConfig,
        columnOrder,
        columnLabels: { ...columnLabels, [colId]: value },
      });
    }
    setEditingColumnId(null);
    setEditingLabel("");
  }

  async function handleCreateTask(payload: {
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    category: string;
    effort: string;
    due_date?: string | null;
  }) {
    const maxPos = Math.max(0, ...byStatus(payload.status).map((t) => t.position), -1);
    await onTaskCreate({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority as TaskRow["priority"],
      category: payload.category as TaskRow["category"],
      effort: payload.effort as TaskRow["effort"],
      due_date: payload.due_date ?? null,
      position: maxPos + 1,
    });
    setAddTaskColumn(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Filter className="w-4 h-4 shrink-0" />
          <span className="text-sm">Filter</span>
        </div>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={[
            { value: "all", label: "All categories" },
            ...categories.map((c) => ({ value: c.value, label: c.label })),
          ]}
          className="min-w-[160px]"
        />
        <Select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          options={[
            { value: "all", label: "All priorities" },
            ...priorities.map((p) => ({ value: p.value, label: p.label })),
          ]}
          className="min-w-[140px]"
        />
        {onBoardConfigChange && (
          <Button
            variant="ghost"
            className="shrink-0"
            onClick={() => setSettingsOpen(true)}
            title="Board settings (categories & priorities)"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-4 min-h-[420px]">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-shrink-0 w-[320px] flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden"
                >
                  <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between gap-2">
                    {editingColumnId === col.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleColumnLabelSave(col.id);
                            if (e.key === "Escape") setEditingColumnId(null);
                          }}
                          className="text-sm py-1.5"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleColumnLabelSave(col.id)}
                          className="text-xs text-[var(--accent-green)] hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <LayoutList className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <h3 className="text-sm font-medium text-[var(--text-primary)] truncate flex-1">
                          {col.label}
                        </h3>
                        {onBoardConfigChange && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingColumnId(col.id);
                              setEditingLabel(col.label);
                            }}
                            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"
                            title="Edit column name"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-3 flex-1 space-y-3 overflow-y-auto min-h-[120px]">
                    {byStatus(col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard
                              task={task}
                              onOpen={() => setDetailTask(task)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <Button
                      variant="ghost"
                      className="w-full justify-center border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent-green)] hover:border-[var(--accent-green)]"
                      onClick={() => setAddTaskColumn(col.id)}
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      Add task
                    </Button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskDetailModal
        task={detailTask}
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        onSave={async (updates) => {
          if (detailTask) await onTaskUpdate(detailTask.id, updates);
        }}
        onDelete={() => {
          if (detailTask) onTaskDelete(detailTask.id);
        }}
        categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
        priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
      />

      {addTaskColumn && (
        <AddTaskModal
          open={!!addTaskColumn}
          onClose={() => setAddTaskColumn(null)}
          defaultStatus={addTaskColumn as TaskStatus}
          onCreate={handleCreateTask}
          categoryOptions={categories.map((c) => ({ value: c.value, label: c.label }))}
          priorityOptions={priorities.map((p) => ({ value: p.value, label: p.label }))}
        />
      )}

      {onBoardConfigChange && (
        <BoardSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          boardConfig={boardConfig}
          onSave={(config) => onBoardConfigChange(config)}
        />
      )}
    </div>
  );
}
