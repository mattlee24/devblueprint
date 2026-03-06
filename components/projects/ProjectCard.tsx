import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { FolderKanban, ArrowRight, Clock, CheckCircle } from "lucide-react";

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
      <article className="card-hover border border-[var(--border)] rounded-[var(--radius-card)] group overflow-hidden border-l-4 border-l-[var(--accent)] shadow-soft" style={{ background: "var(--gradient-card)" }}>
        {/* Banner with bottom overlay gradient */}
        <div className="relative h-[150px] w-full border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="absolute inset-0" style={bannerStyle} />
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
            }}
          />
        </div>

        <div className="p-5">
          {/* Title (primary) and client (secondary) */}
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent)] shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                {project.title}
              </h3>
              {clientName && (
                <span className="flex items-center gap-1.5 mt-1 text-sm text-[var(--text-secondary)]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: clientColour ?? "var(--border)" }}
                  />
                  {clientName}
                </span>
              )}
            </div>
          </div>

          {/* Key stats strip: task progress + hours + progress bar */}
          <div className="flex items-center gap-3 mb-3 py-2 px-3 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]">
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              {doneCount}/{taskCount} tasks
            </span>
            {hoursLogged > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Clock className="w-3.5 h-3.5" />
                {hoursLogged.toFixed(1)}h logged
              </span>
            )}
            {taskCount > 0 && (
              <div className="flex-1 min-w-0 ml-auto">
                <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-3">
              {project.description}
            </p>
          )}

          {/* Badges: type (accent), stack (+N), status (muted) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge className="bg-[var(--accent)]/15 text-[var(--accent)] border-0">
              {project.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
            {stack.slice(0, 3).map((s) => (
              <Badge key={s} variant="muted">
                {s}
              </Badge>
            ))}
            {stack.length > 3 && (
              <Badge variant="muted">+{stack.length - 3}</Badge>
            )}
            <Badge variant="muted">
              {project.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>

          {/* Metadata row: Created date, hours logged */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
            <span>Created {formatDate(project.created_at)}</span>
            {hoursLogged > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {hoursLogged.toFixed(1)}h logged
              </span>
            )}
          </div>

          {/* CTA */}
          <Button
            variant="secondary"
            className="w-full justify-center text-sm group-hover:bg-[var(--accent)]/15 group-hover:text-[var(--accent)] cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 shrink-0" />
            View project
          </Button>
        </div>
      </article>
    </Link>
  );
}
