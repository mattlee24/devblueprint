"use client";

import type { ProposalSlideBlock, ProposalSlideBlockType } from "@/lib/queries/proposals";
import { Trash2, GripVertical, Type, Heading1, List, ListOrdered, Image as ImageIcon } from "lucide-react";
import { Select } from "@/components/ui/Select";

const BLOCK_TYPES: { value: ProposalSlideBlockType; label: string; icon: React.ReactNode }[] = [
  { value: "paragraph", label: "Paragraph", icon: <Type className="w-3.5 h-3.5" /> },
  { value: "heading", label: "Heading", icon: <Heading1 className="w-3.5 h-3.5" /> },
  { value: "bullets", label: "Bullets", icon: <List className="w-3.5 h-3.5" /> },
  { value: "numbered", label: "Numbered list", icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { value: "image", label: "Image (URL)", icon: <ImageIcon className="w-3.5 h-3.5" /> },
];

const HEADING_LEVELS = [
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
];

export interface ProposalSlideBlockEditorProps {
  block: ProposalSlideBlock;
  onUpdate: (updates: Partial<ProposalSlideBlock>) => void;
  onRemove: () => void;
  /** When provided, block reorder is via DnD; attach to drag handle. */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Optional: is this block being dragged (style). */
  isDragging?: boolean;
}

export function ProposalSlideBlockEditor({
  block,
  onUpdate,
  onRemove,
  dragHandleProps,
  isDragging = false,
}: ProposalSlideBlockEditorProps) {
  const isMultiline = block.type === "paragraph" || block.type === "bullets" || block.type === "numbered";

  return (
    <div
      className={`group relative flex gap-3 items-start rounded-lg border bg-white transition-all duration-150 min-h-[52px] ${
        isDragging ? "shadow-lg border-teal-300 bg-teal-50/50 opacity-90" : "border-[#E8E8E8] hover:border-[#CBD5E1]"
      } focus-within:border-[#CBD5E1] focus-within:shadow-[0_0_0_3px_rgba(0,168,150,0.08)] focus-within:ring-0`}
    >
      {/* Drag handle (left) — only when dragHandleProps provided */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="shrink-0 pt-5 pl-2 cursor-grab active:cursor-grabbing text-[#94a3b8] hover:text-[#64748b] touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <div className="flex-1 min-w-0 py-4 px-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            label=""
            value={block.type}
            onChange={(e) => onUpdate({ type: e.target.value as ProposalSlideBlockType })}
            options={BLOCK_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            fullWidth={false}
            className="w-auto min-w-[140px]"
            triggerClassName="rounded-full border-[#E8E8E8] bg-[#F9F7F4] px-3 py-1.5 text-xs font-medium"
          />
          {block.type === "heading" && (
            <Select
              label=""
              value={String(block.level ?? 1)}
              onChange={(e) => onUpdate({ level: Number(e.target.value) })}
              options={HEADING_LEVELS}
              fullWidth={false}
              className="w-auto min-w-[100px]"
              triggerClassName="rounded-full border-[#E8E8E8] bg-[#F9F7F4] px-3 py-1.5 text-xs"
            />
          )}
        </div>
        {block.type === "image" ? (
          <input
            type="url"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Image URL"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E8E8] bg-[#F9F7F4] text-[#1A1A1A] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition"
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E8E8] bg-[#F9F7F4] text-[#1A1A1A] placeholder:text-[#94a3b8] resize-y min-h-[80px] focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition"
          />
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 rounded text-[#94a3b8] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
        aria-label="Remove block"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
