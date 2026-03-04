"use client";

import type { TaskRow } from "@/lib/queries/tasks";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  columnId: string;
  title: string;
  tasks: TaskRow[];
  onCardOpen: (task: TaskRow) => void;
}

export function KanbanColumn({
  columnId,
  title,
  tasks,
  onCardOpen,
}: KanbanColumnProps) {
  return (
    <div className="min-w-[240px] w-60 flex-shrink-0 border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] p-3">
      <h3 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase">
        {title}
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onOpen={() => onCardOpen(task)}
          />
        ))}
      </div>
    </div>
  );
}
