"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TaskCommentWithAuthor } from "@/lib/queries/taskComments";
import { getCommentsByTask, createTaskComment, deleteTaskComment } from "@/lib/queries/taskComments";
import { getAttachmentsByTask, type TaskAttachmentRow } from "@/lib/queries/taskAttachments";
import { getSubtasksByTask, createSubtask, updateSubtask, deleteSubtask, type SubtaskRow } from "@/lib/queries/subtasks";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { TaskAttachments } from "./TaskAttachments";
import { ThreadedComments } from "./ThreadedComments";
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Trash2, X, Plus, CheckSquare, Square, MessageSquare } from "lucide-react";

const FALLBACK_STATUS_OPTIONS: { value: string; label: string }[] = [
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

export type TaskCreatePayload = Partial<TaskRow> & { title: string };

interface TaskDetailModalPropsBase {
  open: boolean;
  onClose: () => void;
  projectName?: string;
  categoryOptions?: { value: string; label: string }[];
  priorityOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
}

interface TaskDetailModalPropsEdit extends TaskDetailModalPropsBase {
  task: TaskRow;
  onSave: (updates: Partial<TaskRow>) => Promise<void>;
  onDelete: () => void;
  onCreate?: never;
  defaultStatus?: never;
}

interface TaskDetailModalPropsCreate extends TaskDetailModalPropsBase {
  task: null;
  onCreate: (task: TaskCreatePayload, options?: { subtaskTitles?: string[] }) => Promise<void>;
  defaultStatus: TaskStatus;
  onSave?: never;
  onDelete?: never;
}

type TaskDetailModalProps = TaskDetailModalPropsEdit | TaskDetailModalPropsCreate;

const isCreateMode = (props: TaskDetailModalProps): props is TaskDetailModalPropsCreate =>
  props.task === null;

export function TaskDetailModal(props: TaskDetailModalProps) {
  const {
    task,
    open,
    onClose,
    projectName,
    categoryOptions = CATEGORY_OPTIONS,
    priorityOptions = PRIORITY_OPTIONS,
    statusOptions = FALLBACK_STATUS_OPTIONS,
  } = props;

  const createMode = isCreateMode(props);
  const defaultStatus = createMode ? props.defaultStatus : undefined;
  const onCreate = createMode ? props.onCreate : undefined;
  const onSave = !createMode ? props.onSave : undefined;
  const onDelete = !createMode ? props.onDelete : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? statusOptions[0]?.value ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [category, setCategory] = useState<TaskCategory>("dev");
  const [effort, setEffort] = useState<TaskEffort>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<TaskCommentWithAuthor[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentRow[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskRow[]>([]);
  const [createModeSubtaskTitles, setCreateModeSubtaskTitles] = useState<string[]>([]);
  const [highlightedSubtaskId, setHighlightedSubtaskId] = useState<string | null>(null);
  const subtasksSectionRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const loadComments = useCallback(async (taskId: string) => {
    const { data } = await getCommentsByTask(taskId);
    setComments(data ?? []);
  }, []);

  const loadAttachments = useCallback(async (taskId: string) => {
    const { data } = await getAttachmentsByTask(taskId);
    setAttachments(data ?? []);
  }, []);

  const loadSubtasks = useCallback(async (taskId: string) => {
    const { data } = await getSubtasksByTask(taskId);
    setSubtasks(data ?? []);
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
      const taskStatus = task.status as string;
      setStatus(statusOptions.some((o) => o.value === taskStatus) ? taskStatus : (statusOptions[0]?.value ?? "todo"));
      setPriority(task.priority as TaskPriority);
      setCategory(task.category as TaskCategory);
      setEffort(task.effort as TaskEffort);
      setDueDate(task.due_date ?? "");
    } else if (open && createMode) {
      setTitle("");
      setDescription("<p></p>");
      setStatus(defaultStatus ?? statusOptions[0]?.value ?? "todo");
      setPriority("p2");
      setCategory("dev");
      setEffort("medium");
      setDueDate("");
      setCreateModeSubtaskTitles([]);
      setNewSubtaskTitle("");
    }
  }, [task, statusOptions, open, createMode, defaultStatus]);

  useEffect(() => {
    if (open && task?.id) {
      loadComments(task.id);
      loadAttachments(task.id);
      loadSubtasks(task.id);
    } else {
      setComments([]);
      setAttachments([]);
      setSubtasks([]);
      if (!createMode) setNewSubtaskTitle("");
    }
  }, [open, task?.id, loadComments, loadAttachments, loadSubtasks, createMode]);

  async function handleSave() {
    if (task) {
      setSaving(true);
      const desc = description?.trim();
      await onSave!({
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
  }

  async function handleCreate() {
    if (!createMode || !onCreate) return;
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    await onCreate(
      {
        title: t,
        description: description?.trim() && description !== "<p></p>" ? description : null,
        status,
        priority,
        category,
        effort,
        due_date: dueDate.trim() || null,
      },
      createModeSubtaskTitles.length > 0 ? { subtaskTitles: createModeSubtaskTitles } : undefined
    );
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    onDelete?.();
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

  async function handleSubtaskToggle(subtask: SubtaskRow) {
    await updateSubtask(subtask.id, { completed: !subtask.completed });
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtask.id ? { ...s, completed: !s.completed } : s))
    );
  }

  async function handleSubtaskTitleBlur(subtask: SubtaskRow, title: string) {
    const t = title.trim();
    if (t === subtask.title) return;
    if (!t) {
      await deleteSubtask(subtask.id);
      setSubtasks((prev) => prev.filter((s) => s.id !== subtask.id));
      return;
    }
    await updateSubtask(subtask.id, { title: t });
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtask.id ? { ...s, title: t } : s))
    );
  }

  async function handleSubtaskDelete(id: string) {
    await deleteSubtask(id);
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAddSubtask() {
    const titleToAdd = newSubtaskTitle.trim();
    if (createMode) {
      if (!titleToAdd) return;
      setCreateModeSubtaskTitles((prev) => [...prev, titleToAdd]);
      setNewSubtaskTitle("");
      return;
    }
    if (!task || !titleToAdd) return;
    const { data } = await createSubtask(task.id, {
      title: titleToAdd,
      position: subtasks.length,
    });
    if (data) {
      setSubtasks((prev) => [...prev, data]);
      setNewSubtaskTitle("");
    }
  }

  function removeCreateModeSubtask(index: number) {
    setCreateModeSubtaskTitles((prev) => prev.filter((_, i) => i !== index));
  }

  const statusColor =
    status === "done" ? "bg-green-500" : status === "in_review" ? "bg-amber-400" : status === "in_progress" ? "bg-blue-500" : "bg-neutral-300";
  const priorityDot =
    priority === "p1" ? "bg-red-500" : priority === "p2" ? "bg-amber-400" : "bg-green-500";

  const displayTitle = task ? task.title : title || "New task";
  const statusLabel = statusOptions.find((o) => o.value === status)?.label ?? status;
  const modalTitle = createMode ? `New task · ${statusLabel}` : displayTitle;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      overlayClassName="bg-black/40 backdrop-blur-sm"
      contentClassName="max-w-4xl w-full max-h-[94vh] flex flex-col rounded-2xl shadow-xl border border-neutral-200 bg-white"
      contentInnerClassName="flex-1 min-h-0 overflow-hidden flex flex-col p-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] flex-1 min-h-0 overflow-hidden">
        {/* Left column: task content */}
        <div className="flex flex-col min-w-0 overflow-hidden border-r border-neutral-200">
          <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Breadcrumb + title */}
            {projectName && (
              <p className="text-xs text-neutral-400">
                {projectName} › {createMode ? "New task" : title || (task?.title ?? "")}
              </p>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-2xl font-semibold font-mono bg-transparent border-0 border-b border-transparent focus:border-teal-400 focus:outline-none pb-1 text-neutral-900 placeholder:text-neutral-400"
              aria-label="Task title"
            />
            {/* Metadata row: compact pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                label=""
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                fullWidth={false}
                triggerClassName="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 text-xs font-medium hover:bg-neutral-50 min-h-0 h-auto w-auto min-w-0"
                leading={<span className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />}
              />
              <Select
                label=""
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                fullWidth={false}
                triggerClassName="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 text-xs font-medium hover:bg-neutral-50 min-h-0 h-auto w-auto min-w-0"
                leading={<span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`} />}
              />
              <Select
                label=""
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                fullWidth={false}
                triggerClassName="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 text-xs font-medium hover:bg-neutral-50 min-h-0 h-auto w-auto min-w-0"
              />
              <Select
                label=""
                options={EFFORT_OPTIONS}
                value={effort}
                onChange={(e) => setEffort(e.target.value as TaskEffort)}
                fullWidth={false}
                triggerClassName="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 text-xs font-medium hover:bg-neutral-50 min-h-0 h-auto w-auto min-w-0"
              />
              <DatePicker
                label=""
                value={dueDate}
                onChange={setDueDate}
                placeholder="No date"
                className="w-auto min-w-0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Description</label>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <RichTextEditor value={description} onChange={setDescription} minHeight="160px" className="border-0 rounded-none" />
              </div>
            </div>
            <div ref={subtasksSectionRef}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Subtasks</span>
                <span className="bg-neutral-100 text-neutral-500 text-xs px-1.5 rounded-full">
                  {createMode
                    ? `${createModeSubtaskTitles.length}`
                    : `${subtasks.filter((s) => s.completed).length}/${subtasks.length}`}
                </span>
              </div>
              <ul className="space-y-2">
                {createMode
                  ? createModeSubtaskTitles.map((stTitle, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 group py-1 rounded hover:bg-neutral-50 transition-colors"
                      >
                        <Square className="w-5 h-5 text-neutral-400 shrink-0" />
                        <span className="flex-1 min-w-0 text-sm text-neutral-900">{stTitle}</span>
                        <button
                          type="button"
                          onClick={() => removeCreateModeSubtask(index)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 text-neutral-400 cursor-pointer shrink-0"
                          aria-label="Remove subtask"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))
                  : subtasks.map((subtask) => (
                      <li
                        key={subtask.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          subtasksSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                          setHighlightedSubtaskId(subtask.id);
                          setTimeout(() => setHighlightedSubtaskId(null), 1500);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            subtasksSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                            setHighlightedSubtaskId(subtask.id);
                            setTimeout(() => setHighlightedSubtaskId(null), 1500);
                          }
                        }}
                        className={`flex items-center gap-2 group py-1 rounded hover:bg-neutral-50 cursor-pointer transition-colors ${highlightedSubtaskId === subtask.id ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-white bg-neutral-50" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubtaskToggle(subtask);
                          }}
                          className="p-0.5 rounded text-neutral-400 hover:text-teal-500 cursor-pointer shrink-0"
                          aria-label={subtask.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {subtask.completed ? (
                            <CheckSquare className="w-5 h-5 text-teal-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          type="text"
                          defaultValue={subtask.title}
                          onBlur={(e) => handleSubtaskTitleBlur(subtask, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          className={`flex-1 min-w-0 bg-transparent border-0 border-b border-transparent focus:border-teal-400 focus:outline-none py-1 text-sm text-neutral-900 placeholder:text-neutral-400 ${subtask.completed ? "line-through text-neutral-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubtaskDelete(subtask.id);
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 text-neutral-400 cursor-pointer shrink-0"
                          aria-label="Delete subtask"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
              </ul>
              <div className="flex gap-2 mt-2">
                <input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubtask();
                  }}
                  placeholder="Add a subtask…"
                  className="flex-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  className="text-teal-500 hover:text-teal-600 text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  + Add
                </button>
              </div>
            </div>
            {task ? (
              <TaskAttachments
                taskId={task.id}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-3">
                <p className="text-sm text-neutral-500">Save the task to add attachments.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 bg-neutral-50/50">
            {!createMode && task && (
              <div className="text-xs text-neutral-400 font-mono flex gap-4">
                <span>Created {formatDate(task.created_at)}</span>
                <span>Updated {formatDate(task.updated_at)}</span>
              </div>
            )}
            <div className={`flex items-center gap-2 ${createMode ? "" : "ml-auto"}`}>
              {!createMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 inline-block mr-1.5 align-middle" />
                  Delete task
                </button>
              )}
              <div className={`flex gap-2 ${!createMode ? "ml-auto" : ""}`}>
                {createMode ? (
                  <Button onClick={handleCreate} disabled={!title.trim() || saving} className="cursor-pointer flex items-center gap-1.5">
                    <Plus className="w-4 h-4 shrink-0" />
                    {saving ? "Adding…" : "Add task"}
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
                    {saving ? "Saving…" : "Save"}
                  </Button>
                )}
                <Button variant="secondary" onClick={onClose} className="cursor-pointer">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Right column: comments */}
        <div className="w-full lg:w-[280px] flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-neutral-50/30">
          <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
            {task ? (
              <ThreadedComments
                taskId={task.id}
                comments={comments}
                currentUserId={currentUserId}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onDeleteComment={handleDeleteComment}
              />
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 pb-3 border-b border-neutral-100">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  Comments
                </div>
                <p className="text-sm text-neutral-400 text-center pt-8">Save the task to add comments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
