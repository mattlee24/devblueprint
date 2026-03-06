"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TaskCommentRow } from "@/lib/queries/taskComments";
import { getCommentsByTask, createTaskComment, deleteTaskComment } from "@/lib/queries/taskComments";
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Trash2, MessageSquare, X } from "lucide-react";

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
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<TaskCommentRow[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadComments = useCallback(async (taskId: string) => {
    const { data } = await getCommentsByTask(taskId);
    setComments(data ?? []);
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
      setDescription(task.description ?? "");
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
    } else {
      setComments([]);
      setCommentBody("");
    }
  }, [open, task?.id, loadComments]);

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
      due_date: dueDate.trim() || null,
    });
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  async function handleAddComment() {
    if (!task || !commentBody.trim()) return;
    setCommentLoading(true);
    const { data, error } = await createTaskComment(task.id, commentBody.trim());
    setCommentLoading(false);
    if (error) return;
    setCommentBody("");
    if (data) setComments((prev) => [...prev, data]);
  }

  async function handleDeleteComment(id: string) {
    await deleteTaskComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose} title="Task details" contentClassName="max-w-2xl w-full">
      <div className="max-h-[70vh] overflow-y-auto space-y-5 -m-4 p-4">
        {/* Header: title + meta */}
        <div className="space-y-3">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={5}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none resize-y min-h-[100px]"
          />
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
            Comments ({comments.length})
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-elevated)]/50">
            {comments.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="text-sm py-2 px-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-[var(--text-primary)]">
                      {currentUserId === c.user_id ? "You" : "Comment"}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(c.created_at)}</span>
                      {currentUserId === c.user_id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"
                          aria-label="Delete comment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{c.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none resize-none text-sm"
            />
            <Button
              onClick={handleAddComment}
              disabled={!commentBody.trim() || commentLoading}
              className="shrink-0 self-end cursor-pointer"
            >
              {commentLoading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex gap-4">
          <span>Created {formatDate(task.created_at)}</span>
          <span>Updated {formatDate(task.updated_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="secondary" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} className="ml-auto cursor-pointer">
            <Trash2 className="w-4 h-4 shrink-0" />
            Delete task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
