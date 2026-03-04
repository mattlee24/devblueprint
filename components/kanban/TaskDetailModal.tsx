"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from "@/lib/types";
import { Trash2 } from "lucide-react";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "p1", label: "P1 – High" },
  { value: "p2", label: "P2 – Medium" },
  { value: "p3", label: "P3 – Low" },
];

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: "dev", label: "Dev" },
  { value: "design", label: "Design" },
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "devops", label: "DevOps" },
  { value: "testing", label: "Testing" },
  { value: "other", label: "Other" },
];

const EFFORT_OPTIONS: { value: TaskEffort; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface TaskDetailModalProps {
  task: TaskRow | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<TaskRow>) => Promise<void>;
  onDelete: () => void;
  categoryOptions?: { value: string; label: string }[];
  priorityOptions?: { value: string; label: string }[];
}

export function TaskDetailModal({
  task,
  open,
  onClose,
  onSave,
  onDelete,
  categoryOptions = CATEGORY_OPTIONS,
  priorityOptions = PRIORITY_OPTIONS,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [category, setCategory] = useState<TaskCategory>("dev");
  const [effort, setEffort] = useState<TaskEffort>("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status as TaskStatus);
      setPriority(task.priority as TaskPriority);
      setCategory(task.category as TaskCategory);
      setEffort(task.effort as TaskEffort);
    }
  }, [task]);

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    await onSave({
      title: title.trim() || task.title,
      description: description.trim() || null,
      status,
      priority,
      category,
      effort,
    });
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose} title="Task details">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
          />
          <Select
            label="Effort"
            options={EFFORT_OPTIONS}
            value={effort}
            onChange={(e) => setEffort(e.target.value as TaskEffort)}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Delete task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
