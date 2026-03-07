import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";

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
  const stack = (project.stack as string[]) ?? [];
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

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
      className="cursor-pointer block"
    >
      <Card hover className="h-full flex flex-col overflow-hidden group">
        {/* Compact banner with gradient overlay */}
        <div className="relative h-28 w-full bg-[var(--bg-elevated)] shrink-0">
          <div className="absolute inset-0" style={bannerStyle} />
          <div
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.25), transparent)",
            }}
          />
        </div>

        <div className="p-5 flex flex-col flex-1 min-h-0">
          {/* Title as hero, client and type as secondary */}
          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate mb-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {clientName && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: clientColour ?? "var(--border)" }}
                />
                {clientName}
              </span>
            )}
            <Badge className="bg-[var(--accent)]/15 text-[var(--accent)] border-0 text-xs">
              {project.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>

          {/* Single metric row: tasks + hours + progress bar */}
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]/60 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              {doneCount}/{taskCount} tasks
            </span>
            {hoursLogged > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {hoursLogged.toFixed(1)}h
              </span>
            )}
            {taskCount > 0 && (
              <div className="flex-1 min-w-0">
                <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description - one or two lines */}
          {project.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-3 flex-1 min-h-0">
              {project.description}
            </p>
          )}

          {/* Minimal badges: stack (max 2) + status */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {stack.slice(0, 2).map((s) => (
              <Badge key={s} variant="muted">
                {s}
              </Badge>
            ))}
            {stack.length > 2 && <Badge variant="muted">+{stack.length - 2}</Badge>}
            <Badge variant="muted">
              {project.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>

          {/* Footer: date + CTA */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">Created {formatDate(project.created_at)}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] group-hover:underline">
              View project
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
