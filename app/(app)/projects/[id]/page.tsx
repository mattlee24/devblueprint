"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getProject, updateProject, deleteProject, type BoardConfig } from "@/lib/queries/projects";
import { getTasksByProject, updateTask, deleteTask, createTask } from "@/lib/queries/tasks";
import { createSubtask } from "@/lib/queries/subtasks";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TaskRow } from "@/lib/queries/tasks";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { BlueprintTab } from "@/components/blueprint/BlueprintTab";
import { TaskBoardSection } from "@/components/kanban/TaskBoardSection";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatHoursShort, formatCurrency } from "@/lib/utils";
import type { Blueprint } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" && params.id.trim() ? params.id.trim() : null;
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Project not found");
      return;
    }
    const projectId = id;
    async function load() {
      const [pRes, tRes, tlRes] = await Promise.all([
        getProject(projectId),
        getTasksByProject(projectId),
        getTimeLogs({ projectId }),
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
    if (!id) return;
    const projectId = id;
    const supabase = createClient();
    channelRef.current = supabase
      .channel(`tasks:project=${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => {
          getTasksByProject(projectId).then((r) => setTasks(r.data ?? []));
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

  async function handleTaskCreate(
    task: Partial<TaskRow> & { title: string },
    options?: { subtaskTitles?: string[] }
  ) {
    const res = await createTask({
      project_id: id!,
      title: task.title,
      description: task.description ?? null,
      status: (task.status as TaskRow["status"]) ?? "backlog",
      priority: (task.priority as TaskRow["priority"]) ?? "p2",
      category: (task.category as TaskRow["category"]) ?? "dev",
      effort: (task.effort as TaskRow["effort"]) ?? "medium",
      due_date: task.due_date ?? null,
      position: task.position ?? 0,
    });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to create task");
      return;
    }
    if (res.data) {
      const newTask = res.data;
      if (options?.subtaskTitles?.length) {
        for (let i = 0; i < options.subtaskTitles.length; i++) {
          await createSubtask(newTask.id, { title: options.subtaskTitles[i], position: i });
        }
      }
      toast.success("Task created");
      setTasks((prev) => [...prev, newTask]);
    }
  }

  async function handleBoardConfigChange(board_config: BoardConfig) {
    if (!project) return;
    const newOrder = board_config.columnOrder ?? [];
    const firstStatus = newOrder[0];
    if (firstStatus) {
      const toMigrate = tasks.filter((t) => !newOrder.includes(t.status));
      for (const t of toMigrate) {
        await updateTask(t.id, { status: firstStatus });
      }
      if (toMigrate.length > 0) {
        setTasks((prev) =>
          prev.map((t) => (toMigrate.some((m) => m.id === t.id) ? { ...t, status: firstStatus } : t))
        );
        toast.success(`${toMigrate.length} task(s) moved to ${board_config.columnLabels?.[firstStatus] ?? firstStatus}`);
      }
    }
    const res = await updateProject(project.id, { board_config });
    if (res.error) toast.error(res.error?.message ?? "Failed to save board settings");
    else if (res.data) {
      setProject(res.data);
      toast.success("Board settings saved");
    }
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
    a.download = `project-${project.title.replace(/\s+/g, "-").toLowerCase()}-${id!.slice(0, 8)}.json`;
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

  if (!id) {
    return (
      <main>
        <PageContainer>
          <p className="text-[var(--text-secondary)]">Project not found.</p>
          <Link href="/projects" className="text-[var(--accent)] hover:underline mt-2 inline-block cursor-pointer">Back to projects</Link>
        </PageContainer>
      </main>
    );
  }
  if (loading) {
    return (
      <main>
        <PageContainer>
          <div className="animate-pulse text-[var(--text-muted)]">Loading…</div>
        </PageContainer>
      </main>
    );
  }
  if (error || !project) {
    return (
      <main>
        <PageContainer>
          <p className="text-[var(--accent-red)]">Something went wrong. {error ?? "Project not found"}</p>
          <Link href="/projects" className="text-[var(--accent)] hover:underline mt-2 inline-block cursor-pointer">Back to projects</Link>
        </PageContainer>
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

  const boardConfig = project.board_config as BoardConfig | null;
  const defaultTaskStatus = (boardConfig?.columnOrder?.length ? boardConfig.columnOrder[0] : "todo") as string;

  const tabs = [
    {
      id: "blueprint",
      label: "Blueprint",
      content: (
        <BlueprintTab
          blueprint={blueprint}
          projectId={id!}
          projectUpdatedAt={project.updated_at}
          onTaskCreate={handleTaskCreate}
          defaultTaskStatus={defaultTaskStatus}
          taskCount={tasks.length}
        />
      ),
    },
    {
      id: "tasks",
      label: "Task Board",
      content: (
        <TaskBoardSection
          projectId={id!}
          project={project}
          tasks={tasks}
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
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex flex-wrap justify-between items-center gap-3">
            <p className="text-sm text-neutral-500">
              Total: <span className="font-medium text-neutral-900">{formatHoursShort(hoursLogged)}</span>
              {" · "}
              Billable: <span className="font-medium text-teal-600">{formatCurrency(billableAmount, currency)}</span>
            </p>
            <Link
              href={`/time-logs?project=${project.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 cursor-pointer"
            >
              <Clock className="w-4 h-4 shrink-0" />
              + Log time
            </Link>
          </div>
          {timeLogs.length === 0 ? (
            <p className="text-neutral-400 p-6 text-center text-sm">No time logs for this project.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Hours</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Billable</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {timeLogs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-neutral-600">{log.logged_date}</td>
                    <td className="py-3 px-4 text-neutral-900">{log.description}</td>
                    <td className="text-right py-3 px-4">{log.hours}</td>
                    <td className="py-3 px-4">
                      <Badge variant={log.billable ? "teal" : "muted"}>
                        {log.billable ? "Billable" : "Non-billable"}
                      </Badge>
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
  ];

  return (
    <main>
      <PageContainer>
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
        billableAmount={billableAmount}
        currency={currency}
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
      </PageContainer>
    </main>
  );
}
