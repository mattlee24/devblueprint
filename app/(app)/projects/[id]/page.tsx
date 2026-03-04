"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getProject, updateProject, deleteProject, type BoardConfig } from "@/lib/queries/projects";
import { getTasksByProject, updateTask, deleteTask, createTask } from "@/lib/queries/tasks";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { BlueprintTab } from "@/components/blueprint/BlueprintTab";
import { ScopeTab } from "@/components/projects/ScopeTab";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatHoursShort, formatCurrency } from "@/lib/utils";
import type { Blueprint } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    async function load() {
      const [pRes, tRes, tlRes] = await Promise.all([
        getProject(id),
        getTasksByProject(id),
        getTimeLogs({ projectId: id }),
      ]);
      if (pRes.error) setError(pRes.error.message);
      else setProject(pRes.data ?? null);
      setTasks(tRes.data ?? []);
      setTimeLogs(tlRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    const supabase = createClient();
    channelRef.current = supabase
      .channel(`tasks:project=${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${id}` },
        () => {
          getTasksByProject(id).then((r) => setTasks(r.data ?? []));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channelRef.current!);
      channelRef.current = null;
    };
  }, [id]);

  async function handleTaskUpdate(taskId: string, updates: Partial<TaskRow>) {
    const { error } = await updateTask(taskId, updates);
    if (error) {
      toast.error(error.message ?? "Failed to update task");
      return;
    }
    toast.success("Task updated");
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }

  async function handleTaskDelete(taskId: string) {
    const { error } = await deleteTask(taskId);
    if (error) {
      toast.error(error.message ?? "Failed to delete task");
      return;
    }
    toast.success("Task deleted");
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function handleTaskCreate(task: Partial<TaskRow> & { title: string }) {
    const res = await createTask({
      project_id: id,
      title: task.title,
      description: task.description ?? null,
      status: (task.status as TaskRow["status"]) ?? "backlog",
      priority: (task.priority as TaskRow["priority"]) ?? "p2",
      category: (task.category as TaskRow["category"]) ?? "dev",
      effort: (task.effort as TaskRow["effort"]) ?? "medium",
      position: task.position ?? 0,
    });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to create task");
      return;
    }
    if (res.data) {
      toast.success("Task created");
      setTasks((prev) => [...prev, res.data!]);
    }
  }

  function handleBoardConfigChange(board_config: BoardConfig) {
    if (!project) return;
    updateProject(project.id, { board_config }).then((res) => {
      if (res.error) toast.error(res.error?.message ?? "Failed to save board settings");
      else if (res.data) {
        setProject(res.data);
        toast.success("Board settings saved");
      }
    });
  }

  function handleArchive() {
    if (!project) return;
    updateProject(project.id, { status: "archived" }).then((res) => {
      if (res.error) toast.error(res.error?.message ?? "Failed to archive");
      else if (res.data) {
        setProject(res.data);
        toast.success("Project archived");
      }
    });
  }

  function handleExportJson() {
    if (!project) return;
    const payload = {
      project: {
        ...project,
        tasks,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${project.title.replace(/\s+/g, "-").toLowerCase()}-${id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteConfirm() {
    if (!project) return;
    setDeleteLoading(true);
    const { error } = await deleteProject(project.id);
    setDeleteLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to delete project");
      return;
    }
    toast.success("Project deleted");
    router.push("/projects");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">░░░░░░░░░░ Loading...</div>
      </main>
    );
  }
  if (error || !project) {
    return (
      <main className="p-6">
        <p className="text-[var(--accent-red)]">{"> ERROR: "}{error ?? "Project not found"}</p>
      </main>
    );
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const hoursLogged = timeLogs.reduce((s, l) => s + l.hours, 0);
  const billableAmount = timeLogs
    .filter((l) => l.billable && l.hourly_rate != null)
    .reduce((s, l) => s + l.hours * (l.hourly_rate ?? 0), 0);
  const currency = (project as unknown as { clients?: { currency?: string } })?.clients?.currency ?? "GBP";

  const blueprint = project.blueprint as Blueprint | null;

  const tabs = [
    {
      id: "blueprint",
      label: "Blueprint",
      content: <BlueprintTab blueprint={blueprint} />,
    },
    {
      id: "scope",
      label: "Scope & context",
      content: <ScopeTab project={project} blueprint={blueprint} />,
    },
    {
      id: "tasks",
      label: "Task Board",
      content: (
        <KanbanBoard
          tasks={tasks}
          boardConfig={project.board_config ?? null}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskCreate={handleTaskCreate}
          onBoardConfigChange={handleBoardConfigChange}
        />
      ),
    },
    {
      id: "timelogs",
      label: "Time Logs",
      content: (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Total: <span className="font-medium text-[var(--text-primary)]">{formatHoursShort(hoursLogged)}</span>
              {" · "}
              Billable: <span className="font-medium text-[var(--accent-green)]">{formatCurrency(billableAmount, currency)}</span>
            </p>
          </div>
          {timeLogs.length === 0 ? (
            <p className="text-[var(--text-muted)] p-6 text-center">No time logs for this project.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                  <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Description</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Hours</th>
                  <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Billable</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {timeLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{log.logged_date}</td>
                    <td className="py-3 px-4 text-[var(--text-primary)]">{log.description}</td>
                    <td className="text-right py-3 px-4">{log.hours}</td>
                    <td className="py-3 px-4">
                      <span className={log.billable ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}>
                        {log.billable ? "Billable" : "Non-billable"}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {log.billable && log.hourly_rate != null
                        ? formatCurrency(log.hours * log.hourly_rate, log.currency)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ),
    },
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 flex items-center gap-4">
              <ProgressRing value={doneCount} max={tasks.length || 1} />
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Tasks complete</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {doneCount} <span className="text-[var(--text-muted)] font-normal">/ {tasks.length}</span>
                </p>
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Open tasks</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{tasks.length - doneCount}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Hours logged</p>
              <p className="text-2xl font-bold text-[var(--accent-green)]">{formatHoursShort(hoursLogged)}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Billable amount</p>
              <p className="text-2xl font-bold text-[var(--accent-green)]">{formatCurrency(billableAmount, currency)}</p>
            </div>
          </div>
          {project.description && (
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Project description</p>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{project.description}</p>
            </div>
          )}
          {(project.stack as string[])?.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Stack</p>
              <div className="flex flex-wrap gap-2">
                {(project.stack as string[]).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded border border-[var(--border)] text-sm text-[var(--text-secondary)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="p-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
        className="mb-4"
      />
      <ProjectHeader
        project={project}
        taskCount={tasks.length}
        doneCount={doneCount}
        hoursLogged={hoursLogged}
        onArchive={handleArchive}
        onExportJson={handleExportJson}
        onDelete={() => setDeleteConfirmOpen(true)}
      />
      <Tabs tabs={tabs} defaultTab="blueprint" />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete project"
        message={`Delete "${project.title}"? This will remove the project and all its tasks. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </main>
  );
}
