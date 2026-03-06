"use client";

import type { TaskRow } from "@/lib/queries/tasks";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { GripVertical } from "lucide-react";

const PRIORITY_VARIANT = { p1: "danger" as const, p2: "warning" as const, p3: "muted" as const };

interface KanbanCardProps {
  task: TaskRow;
  onOpen: () => void;
}

export function KanbanCard({ task, onOpen }: KanbanCardProps) {
  const priorityVariant = PRIORITY_VARIANT[task.priority as keyof typeof PRIORITY_VARIANT] ?? "default";
  const dueDate = task.due_date ?? null;
  const isOverdue = dueDate ? new Date(dueDate).toDateString() < new Date().toDateString() : false;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="group w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-elevated)] hover:border-[var(--border-active)] transition-all cursor-pointer text-left"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden>
          <GripVertical className="w-3.5 h-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant={priorityVariant} className="text-[10px] px-1.5 py-0">
              {task.priority.replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
            <span className="text-[10px] text-[var(--text-muted)]">{task.category}</span>
            {dueDate && (
              <span className={`text-[10px] ${isOverdue ? "text-[var(--accent-warning)] font-medium" : "text-[var(--text-muted)]"}`}>
                {isOverdue ? "Overdue" : `Due ${formatDate(dueDate)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
