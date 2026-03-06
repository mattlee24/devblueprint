"use client";

import { useState, useMemo } from "react";
import type { TaskRow } from "@/lib/queries/tasks";
import { formatDate } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface TaskCalendarViewProps {
  tasks: TaskRow[];
  onTaskClick: (task: TaskRow) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TaskCalendarView({ tasks, onTaskClick }: TaskCalendarViewProps) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthLabel = current.toLocaleString("default", { month: "long", year: "numeric" });

  const { days, unscheduled } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const days: { date: Date; dateKey: string; tasks: TaskRow[] }[] = [];
    for (let i = 0; i < startPad; i++) {
      days.push({ date: new Date(year, month, -startPad + i + 1), dateKey: "", tasks: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateKey = date.toISOString().slice(0, 10);
      const dayTasks = tasks.filter((t) => t.due_date === dateKey);
      days.push({ date, dateKey, tasks: dayTasks });
    }
    const unscheduled = tasks.filter((t) => !t.due_date || t.due_date === "");
    return { days, unscheduled };
  }, [year, month, tasks]);

  const goPrev = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
          >
            {monthLabel}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">No due date</h3>
          <ul className="space-y-1">
            {unscheduled.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onTaskClick(task)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg-hover)] text-sm text-[var(--text-primary)] cursor-pointer"
                >
                  {task.title}
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{task.status.replace("_", " ")}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-2 px-1 text-center text-xs font-medium text-[var(--text-muted)]">
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr min-h-[400px]">
          {days.map((cell, i) => {
            const isCurrentMonth = cell.date.getMonth() === month;
            return (
              <div
                key={i}
                className={`min-h-[80px] border-b border-r border-[var(--border)] last:border-r-0 p-2 ${
                  isCurrentMonth ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-surface)]/50"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isCurrentMonth ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                  {cell.date.getDate()}
                </div>
                <ul className="space-y-1">
                  {cell.tasks.slice(0, 3).map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => onTaskClick(task)}
                        className="w-full text-left px-2 py-1 rounded text-xs truncate hover:bg-[var(--bg-hover)] cursor-pointer border-l-2 border-[var(--accent)] bg-[var(--bg-surface)]/80"
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    </li>
                  ))}
                  {cell.tasks.length > 3 && (
                    <li className="text-xs text-[var(--text-muted)] pl-2">
                      +{cell.tasks.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
