"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TaskCommentWithAuthor } from "@/lib/queries/taskComments";
import { getCommentsByTask, createTaskComment, deleteTaskComment } from "@/lib/queries/taskComments";
import { getAttachmentsByTask, type TaskAttachmentRow } from "@/lib/queries/taskAttachments";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { TaskAttachments } from "./TaskAttachments";
import { ThreadedComments } from "./ThreadedComments";
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Trash2, X } from "lucide-react";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "p1", label: "P1" },
  { value: "p2", label: "P2" },
  { value: "p3", label: "P3" },
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
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<TaskCommentWithAuthor[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadComments = useCallback(async (taskId: string) => {
    const { data } = await getCommentsByTask(taskId);
    setComments(data ?? []);
  }, []);

  const loadAttachments = useCallback(async (taskId: string) => {
    const { data } = await getAttachmentsByTask(taskId);
    setAttachments(data ?? []);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description?.trim() && task.description !== "<p></p>" ? task.description : "<p></p>");
      setStatus(task.status as TaskStatus);
      setPriority(task.priority as TaskPriority);
      setCategory(task.category as TaskCategory);
      setEffort(task.effort as TaskEffort);
      setDueDate(task.due_date ?? "");
    }
  }, [task]);

  useEffect(() => {
    if (open && task?.id) {
      loadComments(task.id);
      loadAttachments(task.id);
    } else {
      setComments([]);
      setAttachments([]);
    }
  }, [open, task?.id, loadComments, loadAttachments]);

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    const desc = description?.trim();
    await onSave({
      title: title.trim() || task.title,
      description: desc && desc !== "<p></p>" ? desc : null,
      status,
      priority,
      category,
      effort,
      due_date: dueDate.trim() || null,
    });
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  async function handleAddComment(body: string) {
    if (!task) return;
    await createTaskComment(task.id, body);
    loadComments(task.id);
  }

  async function handleAddReply(parentId: string, body: string) {
    if (!task) return;
    await createTaskComment(task.id, body, parentId);
    loadComments(task.id);
  }

  async function handleDeleteComment(id: string) {
    await deleteTaskComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Task details"
      contentClassName="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col"
      contentInnerClassName="flex-1 min-h-0 overflow-hidden flex flex-col p-0"
    >
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Left column: task content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-[var(--border)]">
          <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-xl font-semibold bg-transparent border-0 border-b border-transparent focus:border-[var(--border-active)] focus:outline-none pb-1 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            {/* Compact controls strip */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                label=""
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-32"
              />
              <Select
                label=""
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-24"
              />
              <Select
                label=""
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-28"
              />
              <Select
                label=""
                options={EFFORT_OPTIONS}
                value={effort}
                onChange={(e) => setEffort(e.target.value as TaskEffort)}
                className="w-24"
              />
              <div className="flex items-center gap-1">
                <label className="text-xs text-[var(--text-muted)]">Due</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-2 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
              <RichTextEditor value={description} onChange={setDescription} minHeight="200px" />
            </div>
            <TaskAttachments
              taskId={task.id}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
          <div className="p-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 bg-[var(--bg-elevated)]/50">
            <div className="text-xs text-[var(--text-muted)] flex gap-4">
              <span>Created {formatDate(task.created_at)}</span>
              <span>Updated {formatDate(task.updated_at)}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="secondary" onClick={onClose} className="cursor-pointer">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} className="cursor-pointer">
                <Trash2 className="w-4 h-4 shrink-0" />
                Delete task
              </Button>
            </div>
          </div>
        </div>
        {/* Right column: comments */}
        <div className="w-full lg:w-[380px] flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l border-[var(--border)] bg-[var(--bg-elevated)]/30">
          <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
            <ThreadedComments
              taskId={task.id}
              comments={comments}
              currentUserId={currentUserId}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
