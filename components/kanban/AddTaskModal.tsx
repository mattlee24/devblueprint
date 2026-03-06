"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from "@/lib/types";
import { Plus } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "p1", label: "P1 – High" },
  { value: "p2", label: "P2 – Medium" },
  { value: "p3", label: "P3 – Low" },
];

const CATEGORY_OPTIONS = [
  { value: "dev", label: "Dev" },
  { value: "design", label: "Design" },
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "devops", label: "DevOps" },
  { value: "testing", label: "Testing" },
  { value: "other", label: "Other" },
];

const EFFORT_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus: TaskStatus;
  onCreate: (task: { title: string; description?: string | null; status: TaskStatus; priority: TaskPriority; category: TaskCategory; effort: TaskEffort; due_date?: string | null }) => Promise<void>;
  categoryOptions?: { value: string; label: string }[];
  priorityOptions?: { value: string; label: string }[];
}

export function AddTaskModal({
  open,
  onClose,
  defaultStatus,
  onCreate,
  categoryOptions = CATEGORY_OPTIONS,
  priorityOptions = PRIORITY_OPTIONS,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [category, setCategory] = useState<TaskCategory>("dev");
  const [effort, setEffort] = useState<TaskEffort>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    await onCreate({
      title: t,
      description: description.trim() || null,
      status: defaultStatus,
      priority,
      category,
      effort,
      due_date: dueDate.trim() || null,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`New task · ${STATUS_LABELS[defaultStatus] ?? defaultStatus}`}>
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
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
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCreate} disabled={!title.trim() || saving}>
            <Plus className="w-4 h-4 shrink-0" />
            {saving ? "Adding…" : "Add task"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
