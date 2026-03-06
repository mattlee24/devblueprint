import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { FolderKanban, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: ProjectRow;
  taskCount?: number;
  doneCount?: number;
  hoursLogged?: number;
}

export function ProjectCard({
  project,
  taskCount = 0,
  doneCount = 0,
  hoursLogged = 0,
}: ProjectCardProps) {
  const clientName = (project as unknown as { clients?: { name: string } })?.clients?.name;
  const clientColour = (project as unknown as { clients?: { avatar_colour?: string } })?.clients?.avatar_colour;

  const bannerStyle: CSSProperties = {
    backgroundImage: `url(${project.banner_url || "/images/default-project-banner.svg"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      data-context-menu="project"
      data-context-id={project.id}
      className="cursor-pointer"
    >
      <article className="border border-[var(--border)] rounded-[var(--radius-card)] card-gradient card-hover transition-[var(--transition)] group overflow-hidden">
        <div
          className="h-[150px] w-full border-b border-[var(--border)] bg-[var(--bg-elevated)]"
          style={bannerStyle}
        />
        <div className="flex items-center justify-center gap-2 mb-2 px-4 pt-5">
          <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent)] shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold group-hover:text-[var(--accent)] truncate">
              {project.title}
            </h3>
            {clientName && (
              <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: clientColour ?? "var(--border)" }}
                />
                {clientName}
              </span>
            )}
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 px-4">
            {project.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3 px-4">
          <Badge variant="default">{project.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
          {(project.stack as string[])?.slice(0, 3).map((s) => (
            <Badge key={s} variant="muted">
              {s}
            </Badge>
          ))}
          <Badge variant="default">{project.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3 px-4">
          <span>
            {doneCount}/{taskCount} tasks
          </span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        {hoursLogged > 0 && (
          <p className="text-xs text-[var(--text-secondary)] mb-3 px-4">
            {hoursLogged.toFixed(1)}h logged
          </p>
        )}
        <div className="px-4 pb-3">
        <Button variant="ghost" className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 shrink-0" />
          View
        </Button>
        </div>
      </article>
    </Link>
  );
}
