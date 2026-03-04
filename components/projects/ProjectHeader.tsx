import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Clock, Pencil, Archive, Download, Trash2, User } from "lucide-react";

interface ProjectHeaderProps {
  project: ProjectRow;
  taskCount?: number;
  doneCount?: number;
  hoursLogged?: number;
  onArchive?: () => void;
  onExportJson?: () => void;
  onDelete?: () => void;
}

export function ProjectHeader({
  project,
  taskCount = 0,
  doneCount = 0,
  hoursLogged = 0,
  onArchive,
  onExportJson,
  onDelete,
}: ProjectHeaderProps) {
  const client = (project as unknown as { clients?: { name: string; id: string } })?.clients;

  const bannerStyle: CSSProperties = project.banner_url
    ? {
        backgroundImage: `url(${project.banner_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : (() => {
        const base = project.id ?? project.title;
        let hash = 0;
        for (let i = 0; i < base.length; i += 1) {
          hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
        }
        const hue = hash % 360;
        const hue2 = (hue + 60) % 360;
        return {
          backgroundImage: `linear-gradient(135deg, hsl(${hue},70%,24%), hsl(${hue2},70%,16%))`,
        };
      })();

  return (
    <header className="border-b border-[var(--border)] pb-6 mb-6">
      <div
        className="h-[200px] w-full mb-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)]"
        style={bannerStyle}
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{project.title}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="default">[{project.type.toUpperCase().replace("_", " ")}]</Badge>
            <Badge variant="default">[{project.status.toUpperCase()}]</Badge>
            {(project.stack as string[])?.map((s) => (
              <Badge key={s} variant="muted">
                {s}
              </Badge>
            ))}
          </div>
          {client && (
            <Link
              href={`/clients/${client.id}`}
              className="inline-flex items-center gap-2 mt-2 text-sm text-[var(--accent-blue)] hover:underline"
            >
              <User className="w-4 h-4 shrink-0" />
              {client.name}
            </Link>
          )}
        </div>
        {project.overall_score != null && (
          <div className="text-2xl font-semibold text-[var(--accent-green)]">
            {project.overall_score} / 10
          </div>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] mt-2">
        {"// "}{taskCount} TASKS · {doneCount} DONE · {hoursLogged.toFixed(1)}h LOGGED · CREATED{" "}
        {formatDate(project.created_at)}
      </p>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Link href={`/time-logs?project=${project.id}`}>
          <Button variant="secondary">
            <Clock className="w-4 h-4 shrink-0" />
            Log time
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/edit`}>
          <Button variant="ghost">
            <Pencil className="w-4 h-4 shrink-0" />
            Edit
          </Button>
        </Link>
        <Button variant="ghost" onClick={onArchive} disabled={!onArchive}>
          <Archive className="w-4 h-4 shrink-0" />
          Archive
        </Button>
        <Button variant="ghost" onClick={onExportJson} disabled={!onExportJson}>
          <Download className="w-4 h-4 shrink-0" />
          Export JSON
        </Button>
        <Button variant="danger" onClick={onDelete} disabled={!onDelete}>
          <Trash2 className="w-4 h-4 shrink-0" />
          Delete
        </Button>
      </div>
    </header>
  );
}
