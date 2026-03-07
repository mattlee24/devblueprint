"use client";

import type { ProposalSlideBlock, ProposalSlideBlockType } from "@/lib/queries/proposals";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

const BLOCK_TYPES: { value: ProposalSlideBlockType; label: string }[] = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "bullets", label: "Bullets" },
  { value: "numbered", label: "Numbered list" },
  { value: "image", label: "Image (URL)" },
];

export interface ProposalSlideBlockEditorProps {
  block: ProposalSlideBlock;
  onUpdate: (updates: Partial<ProposalSlideBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ProposalSlideBlockEditor({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ProposalSlideBlockEditorProps) {
  const isMultiline = block.type === "paragraph" || block.type === "bullets" || block.type === "numbered";

  return (
    <div className="flex gap-2 items-start p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] group">
      <div className="flex flex-col shrink-0 gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-0.5 rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-40 cursor-pointer"
          aria-label="Move block up"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-0.5 rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-40 cursor-pointer"
          aria-label="Move block down"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <select
          value={block.type}
          onChange={(e) => onUpdate({ type: e.target.value as ProposalSlideBlockType })}
          className="text-xs rounded border border-[var(--border)] bg-[var(--bg-base)] px-2 py-1 text-[var(--text-primary)] cursor-pointer"
        >
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {block.type === "heading" && (
          <select
            value={block.level ?? 1}
            onChange={(e) => onUpdate({ level: Number(e.target.value) })}
            className="ml-2 text-xs rounded border border-[var(--border)] bg-[var(--bg-base)] px-2 py-1 text-[var(--text-primary)] cursor-pointer"
          >
            <option value={1}>Level 1</option>
            <option value={2}>Level 2</option>
            <option value={3}>Level 3</option>
          </select>
        )}
        {block.type === "image" ? (
          <input
            type="url"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Image URL"
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        ) : (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={
              block.type === "bullets"
                ? "One bullet per line"
                : block.type === "numbered"
                  ? "One item per line"
                  : "Content..."
            }
            rows={isMultiline ? 3 : 1}
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y min-h-[2.5rem]"
          />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)] cursor-pointer shrink-0"
        aria-label="Remove block"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
