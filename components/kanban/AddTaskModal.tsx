"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
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

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus: TaskStatus;
  onCreate: (task: { title: string; description?: string | null; status: TaskStatus; priority: TaskPriority; category: TaskCategory; effort: TaskEffort; due_date?: string | null }) => Promise<void>;
  categoryOptions?: { value: string; label: string }[];
  priorityOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
}

export function AddTaskModal({
  open,
  onClose,
  defaultStatus,
  onCreate,
  categoryOptions = CATEGORY_OPTIONS,
  priorityOptions = PRIORITY_OPTIONS,
  statusOptions,
}: AddTaskModalProps) {
  const statusLabel = statusOptions?.find((o) => o.value === defaultStatus)?.label ?? defaultStatus;
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
    <Modal
      open={open}
      onClose={onClose}
      title={`New task · ${statusLabel}`}
      contentClassName="max-w-md rounded-2xl shadow-xl border border-neutral-200 bg-white"
      contentInnerClassName="p-6"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            minLength={0}
            className="w-full min-h-[80px] rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-colors resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            fullWidth={false}
            className="w-full"
            leading={
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  priority === "p1" ? "bg-red-500" : priority === "p2" ? "bg-amber-400" : "bg-green-500"
                }`}
              />
            }
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            fullWidth={false}
            className="w-full"
          />
          <Select
            label="Effort"
            options={EFFORT_OPTIONS}
            value={effort}
            onChange={(e) => setEffort(e.target.value as TaskEffort)}
            fullWidth={false}
            className="w-full"
          />
          <div className="col-span-2">
            <DatePicker
              label="Due date (optional)"
              value={dueDate}
              onChange={setDueDate}
              placeholder="No date"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 mt-4">
          <Button onClick={handleCreate} disabled={!title.trim() || saving} className="cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4 shrink-0" />
            {saving ? "Adding…" : "Add task"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
