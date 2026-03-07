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
  const columnBorder: Record<string, string> = {
    todo: "border-t-neutral-300",
    in_progress: "border-t-blue-500",
    in_review: "border-t-amber-500",
    done: "border-t-green-500",
  };
  const borderClass = columnBorder[columnId] ?? "border-t-neutral-300";

  return (
    <div className={`min-w-[240px] w-60 flex-shrink-0 border border-neutral-200 rounded-xl bg-white p-3 border-t-4 ${borderClass}`}>
      <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
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
