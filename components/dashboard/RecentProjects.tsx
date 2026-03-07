import Link from "next/link";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { WidgetSectionHeader } from "@/components/ui/Terminal";
import { formatDate } from "@/lib/utils";
import { FolderKanban } from "lucide-react";

interface RecentProjectsProps {
  projects: ProjectRow[];
  maxItems?: number;
  /** When true, the card title is rendered by the parent (e.g. DataCard). */
  hideHeader?: boolean;
}

export function RecentProjects({ projects, maxItems = 5, hideHeader }: RecentProjectsProps) {
  const list = projects.slice(0, maxItems);
  return (
    <div className="flex flex-col min-h-0">
      {!hideHeader && (
        <WidgetSectionHeader>
          <span className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 shrink-0 text-[var(--accent)]" />
            Recent projects
          </span>
        </WidgetSectionHeader>
      )}
      {list.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
          <FolderKanban className="w-4 h-4 opacity-50" />
          No projects yet.
        </p>
      ) : (
        <ul className="space-y-2 flex-1 min-h-0 overflow-hidden">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                data-context-menu="project"
                data-context-id={p.id}
                className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-[var(--transition)] group cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate group-hover:text-[var(--accent)]">
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
        className="inline-flex items-center gap-2 mt-2 text-sm text-[var(--accent)] hover:underline cursor-pointer shrink-0"
      >
        View all
      </Link>
    </div>
  );
}
