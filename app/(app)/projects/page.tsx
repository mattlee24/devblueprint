"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/queries/projects";
import { getClients } from "@/lib/queries/clients";
import { getTasksByProject } from "@/lib/queries/tasks";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import type { ProjectRow } from "@/lib/queries/projects";
import type { ClientRow } from "@/lib/queries/clients";
import { FolderKanban, Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

type StatusFilter = "all" | "active" | "completed" | "archived";
type SortKey = "newest" | "oldest" | "alpha";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; done: number }>>({});
  const [hoursByProject, setHoursByProject] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    async function load() {
      const [pRes, cRes, tRes] = await Promise.all([
        getProjects(),
        getClients(),
        getTimeLogs(),
      ]);
      setProjects(pRes.data ?? []);
      setClients(cRes.data ?? []);
      const logs = tRes.data ?? [];
      const byProject: Record<string, number> = {};
      for (const l of logs) {
        if (l.project_id) byProject[l.project_id] = (byProject[l.project_id] ?? 0) + l.hours;
      }
      setHoursByProject(byProject);
      const counts: Record<string, { total: number; done: number }> = {};
      for (const p of pRes.data ?? []) {
        const tasks = await getTasksByProject(p.id);
        const list = tasks.data ?? [];
        counts[p.id] = {
          total: list.length,
          done: list.filter((t) => t.status === "done").length,
        };
      }
      setTaskCounts(counts);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = projects.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !(p.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (clientFilter && p.client_id !== clientFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return a.title.localeCompare(b.title);
  });

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse text-[var(--text-muted)]">Loading…</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Manage your projects, tasks and progress."
        icon={FolderKanban}
        action={
          <Link href="/projects/new">
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 shrink-0" />
              New project
            </Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "completed", "archived"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-sm rounded-full border transition-colors duration-150 ${
                statusFilter === s
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-neutral-100 hover:border-[var(--border)]"
              }`}
            >
              {s === "all" ? "All" : s.replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <Select
          options={[
            { value: "all", label: "All types" },
            { value: "website", label: "Website" },
            { value: "web_application", label: "Web Application" },
            { value: "mobile_app", label: "Mobile App" },
            { value: "api", label: "API" },
            { value: "cli", label: "CLI" },
            { value: "other", label: "Other" },
          ]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={[
            { value: "", label: "All clients" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-48"
        />
        <Select
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "alpha", label: "A–Z" },
          ]}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-40"
        />
      </div>
      {sorted.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match."
          description="Create a new project to get started."
          action={
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4 shrink-0" />
                New project
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              taskCount={taskCounts[p.id]?.total ?? 0}
              doneCount={taskCounts[p.id]?.done ?? 0}
              hoursLogged={hoursByProject[p.id] ?? 0}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
