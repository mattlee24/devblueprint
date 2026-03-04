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

  const bannerStyle: CSSProperties = project.banner_url
    ? {
        backgroundImage: `url(${project.banner_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : (() => {
        // Deterministic gradient based on project id
        const base = project.id ?? project.title;
        let hash = 0;
        for (let i = 0; i < base.length; i += 1) {
          hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
        }
        const hue = hash % 360;
        const hue2 = (hue + 45) % 360;
        return {
          backgroundImage: `linear-gradient(135deg, hsl(${hue},70%,28%), hsl(${hue2},70%,18%))`,
        };
      })();

  return (
    <Link
      href={`/projects/${project.id}`}
      data-context-menu="project"
      data-context-id={project.id}
    >
      <article className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] hover:border-[var(--border-active)] hover:shadow-[0_0_10px_rgba(0,255,136,0.1)] transition-[var(--transition)] group overflow-hidden">
        <div
          className="h-[150px] w-full border-b border-[var(--border)] bg-[var(--bg-elevated)]"
          style={bannerStyle}
        />
        <div className="flex items-center gap-2 mb-2 px-4 pt-5">
          <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent-green)] shrink-0 -mt-6">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold group-hover:text-[var(--accent-green)] truncate">
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
          <Badge variant="default">[{project.type.toUpperCase().replace("_", " ")}]</Badge>
          {(project.stack as string[])?.slice(0, 3).map((s) => (
            <Badge key={s} variant="muted">
              {s}
            </Badge>
          ))}
          {project.overall_score != null && (
            <Badge variant="success">SCORE: {project.overall_score}/10</Badge>
          )}
          <Badge variant="default">[{project.status.toUpperCase()}]</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3 px-4">
          <span>
            ████░░░░ {doneCount}/{taskCount} TASKS
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
