"use client";

import type { TaskRow } from "@/lib/queries/tasks";
import { formatDate } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface KanbanCardProps {
  task: TaskRow;
  onOpen: () => void;
}

export function KanbanCard({ task, onOpen }: KanbanCardProps) {
  const dueDate = task.due_date ?? null;
  const isOverdue = dueDate ? new Date(dueDate).toDateString() < new Date().toDateString() : false;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="group w-full border border-neutral-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 transition-shadow duration-150 cursor-pointer text-left"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden>
          <GripVertical className="w-3.5 h-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{task.title}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${task.priority === "p1" ? "bg-red-500" : task.priority === "p2" ? "bg-amber-400" : "bg-green-500"}`}
              aria-hidden
            />
            <span className="text-[10px] text-neutral-500">{task.priority.toUpperCase()}</span>
            <span className="text-[10px] text-neutral-500">{task.category}</span>
            {dueDate && (
              <span className={`text-[10px] ${isOverdue ? "text-amber-600 font-medium" : "text-neutral-500"}`}>
                {isOverdue ? "Overdue" : `Due ${formatDate(dueDate)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
