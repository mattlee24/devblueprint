"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectRow } from "@/lib/queries/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Clock, Pencil, Archive, Download, Trash2, User, MoreHorizontal } from "lucide-react";

interface ProjectHeaderProps {
  project: ProjectRow;
  taskCount?: number;
  doneCount?: number;
  hoursLogged?: number;
  billableAmount?: number;
  currency?: string;
  onArchive?: () => void;
  onExportJson?: () => void;
  onDelete?: () => void;
}

export function ProjectHeader({
  project,
  taskCount = 0,
  doneCount = 0,
  hoursLogged = 0,
  billableAmount = 0,
  currency = "GBP",
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
    : {
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      };

  return (
    <header className="border-b border-neutral-200 pb-6 mb-6">
      <div
        className="h-32 w-full mb-4 rounded-xl border border-neutral-200 overflow-hidden"
        style={bannerStyle}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold font-mono text-neutral-900 mb-2">{project.title}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="default">{project.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            <Badge variant="default">{project.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            {(project.stack as string[])?.map((s) => (
              <Badge key={s} variant="muted">
                {s}
              </Badge>
            ))}
          </div>
          {client && (
            <Link
              href={`/clients/${client.id}`}
              className="inline-flex items-center gap-2 mt-2 text-sm text-teal-500 hover:underline"
            >
              <User className="w-4 h-4 shrink-0" />
              {client.name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/time-logs?project=${project.id}`}>
            <Button variant="primary" className="cursor-pointer">
              <Clock className="w-4 h-4 shrink-0" />
              Log time
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="ghost" className="cursor-pointer">
              <Pencil className="w-4 h-4 shrink-0" />
              Edit
            </Button>
          </Link>
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            }
            align="end"
          >
            <DropdownMenuItem
              onSelect={onArchive}
              disabled={!onArchive}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none data-[highlighted]:bg-neutral-100 data-[disabled]:opacity-50"
            >
              <Archive className="w-4 h-4 shrink-0" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onExportJson}
              disabled={!onExportJson}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none data-[highlighted]:bg-neutral-100 data-[disabled]:opacity-50"
            >
              <Download className="w-4 h-4 shrink-0" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator className="h-px bg-neutral-200" />
            <DropdownMenuItem
              onSelect={onDelete}
              disabled={!onDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 cursor-pointer outline-none data-[highlighted]:bg-red-50 data-[disabled]:opacity-50"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 border border-neutral-200 rounded-xl overflow-hidden mt-4">
        <div className="border-r border-neutral-200 last:border-r-0 px-5 py-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Tasks</p>
          <p className="text-xl font-semibold font-mono text-neutral-900">{taskCount}</p>
        </div>
        <div className="border-r border-neutral-200 last:border-r-0 px-5 py-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Done</p>
          <p className="text-xl font-semibold font-mono text-neutral-900">
            {doneCount}/{taskCount || 0}
          </p>
        </div>
        <div className="border-r border-neutral-200 last:border-r-0 px-5 py-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Logged</p>
          <p className="text-xl font-semibold font-mono text-neutral-900">{hoursLogged.toFixed(1)}h</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Billable</p>
          <p className="text-xl font-semibold font-mono text-neutral-900">
            {formatCurrency(billableAmount, currency)}
          </p>
        </div>
      </div>
    </header>
  );
}
