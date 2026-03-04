import Link from "next/link";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { TerminalSectionHeader } from "@/components/ui/Terminal";
import { formatDate } from "@/lib/utils";
import { FolderKanban, ChevronRight } from "lucide-react";

interface RecentProjectsProps {
  projects: ProjectRow[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const list = projects.slice(0, 5);
  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)]">
      <TerminalSectionHeader>
        <span className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 shrink-0" />
          Recent projects
        </span>
      </TerminalSectionHeader>
      {list.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
          <FolderKanban className="w-4 h-4 opacity-50" />
          No projects yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                data-context-menu="project"
                data-context-id={p.id}
                className="flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-[var(--bg-hover)] transition-[var(--transition)] group"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate group-hover:text-[var(--accent-green)]">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="default">{p.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0">
                  {formatDate(p.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 mt-3 text-sm text-[var(--accent)] hover:underline"
      >
        View all
        <ChevronRight className="w-4 h-4 shrink-0" />
      </Link>
    </div>
  );
}
