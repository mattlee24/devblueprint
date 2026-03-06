"use client";

import type { TaskRow } from "@/lib/queries/tasks";
import { Badge } from "@/components/ui/Badge";
import { GripVertical, MessageSquare } from "lucide-react";

const PRIORITY_VARIANT = { p1: "danger" as const, p2: "warning" as const, p3: "muted" as const };

interface KanbanCardProps {
  task: TaskRow;
  onOpen: () => void;
}

export function KanbanCard({ task, onOpen }: KanbanCardProps) {
  const priorityVariant = PRIORITY_VARIANT[task.priority as keyof typeof PRIORITY_VARIANT] ?? "default";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="group w-full border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-elevated)] hover:border-[var(--border-active)] hover:shadow-[0_0_12px_rgba(0,255,136,0.08)] transition-all cursor-pointer text-left"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden>
          <GripVertical className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-xs text-[var(--text-muted)] flex items-center gap-1 line-clamp-2">
              <MessageSquare className="w-3 h-3 shrink-0" />
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant={priorityVariant}>{task.priority.replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            <Badge variant="muted">{task.category}</Badge>
            <Badge variant="muted">{task.effort}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
