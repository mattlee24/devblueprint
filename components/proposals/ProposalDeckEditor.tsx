"use client";

import { useCallback, useState } from "react";
import type {
  ProposalSlide,
  ProposalSlideBlock,
  ProposalSlideBlockType,
} from "@/lib/queries/proposals";
import { Plus, Trash2, GripVertical, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProposalSlideBlockEditor } from "./ProposalSlideBlockEditor";

export interface ProposalDeckEditorProps {
  slides: ProposalSlide[];
  onSlidesChange: (slides: ProposalSlide[]) => void;
  proposalId: string;
}

function nextBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nextSlideId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ProposalDeckEditor({
  slides,
  onSlidesChange,
}: ProposalDeckEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSlide = slides[selectedIndex] ?? null;

  const updateSlides = useCallback(
    (next: ProposalSlide[]) => {
      onSlidesChange(next);
      if (selectedIndex >= next.length) setSelectedIndex(Math.max(0, next.length - 1));
    },
    [onSlidesChange, selectedIndex]
  );

  const updateSlide = useCallback(
    (index: number, updates: Partial<ProposalSlide>) => {
      const next = slides.map((s, i) => (i === index ? { ...s, ...updates } : s));
      updateSlides(next);
    },
    [slides, updateSlides]
  );

  const addSlide = useCallback(() => {
    const newSlide: ProposalSlide = {
      id: nextSlideId(),
      order: slides.length,
      title: "New slide",
      blocks: [],
    };
    updateSlides([...slides, newSlide]);
    setSelectedIndex(slides.length);
  }, [slides, updateSlides]);

  const duplicateSlide = useCallback(
    (index: number) => {
      const src = slides[index];
      if (!src) return;
      const newSlide: ProposalSlide = {
        ...src,
        id: nextSlideId(),
        order: slides.length,
        title: `${src.title} (copy)`,
        blocks: src.blocks.map((b) => ({ ...b, id: nextBlockId() })),
      };
      const next = [...slides];
      next.splice(index + 1, 0, newSlide);
      next.forEach((s, i) => ({ ...s, order: i }));
      updateSlides(next.map((s, i) => ({ ...s, order: i })));
      setSelectedIndex(index + 1);
    },
    [slides, updateSlides]
  );

  const removeSlide = useCallback(
    (index: number) => {
      if (slides.length <= 1) return;
      const slide = slides[index];
      const hasContent =
        (slide?.blocks?.length ?? 0) > 0 || (slide?.title?.trim() ?? "") !== "";
      if (hasContent && !window.confirm("Remove this slide?")) return;
      const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
      updateSlides(next);
      if (selectedIndex >= next.length) setSelectedIndex(next.length - 1);
      else if (selectedIndex > index) setSelectedIndex(selectedIndex - 1);
      else if (selectedIndex === index) setSelectedIndex(Math.min(selectedIndex, next.length - 1));
    },
    [slides, selectedIndex, updateSlides]
  );

  const moveSlide = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= slides.length) return;
      const next = [...slides];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      updateSlides(next.map((s, i) => ({ ...s, order: i })));
      setSelectedIndex(to);
    },
    [slides, updateSlides]
  );

  const addBlock = useCallback(
    (type: ProposalSlideBlockType = "paragraph") => {
      if (selectedSlide == null) return;
      const newBlock: ProposalSlideBlock = {
        id: nextBlockId(),
        type,
        content: "",
      };
      const nextBlocks = [...(selectedSlide.blocks ?? []), newBlock];
      updateSlide(selectedIndex, { blocks: nextBlocks });
    },
    [selectedSlide, selectedIndex, updateSlide]
  );

  const updateBlock = useCallback(
    (blockIndex: number, updates: Partial<ProposalSlideBlock>) => {
      if (selectedSlide == null) return;
      const blocks = [...(selectedSlide.blocks ?? [])];
      blocks[blockIndex] = { ...blocks[blockIndex]!, ...updates };
      updateSlide(selectedIndex, { blocks });
    },
    [selectedSlide, selectedIndex, updateSlide]
  );

  const removeBlock = useCallback(
    (blockIndex: number) => {
      if (selectedSlide == null) return;
      const blocks = (selectedSlide.blocks ?? []).filter((_, i) => i !== blockIndex);
      updateSlide(selectedIndex, { blocks });
    },
    [selectedSlide, selectedIndex, updateSlide]
  );

  const moveBlock = useCallback(
    (blockIndex: number, direction: -1 | 1) => {
      if (selectedSlide == null) return;
      const blocks = [...(selectedSlide.blocks ?? [])];
      const to = blockIndex + direction;
      if (to < 0 || to >= blocks.length) return;
      [blocks[blockIndex], blocks[to]] = [blocks[to]!, blocks[blockIndex]!];
      updateSlide(selectedIndex, { blocks });
    },
    [selectedSlide, selectedIndex, updateSlide]
  );

  if (slides.length === 0) {
    return (
      <div className="border border-[var(--border)] rounded-xl p-8 bg-[var(--bg-surface)] text-center">
        <p className="text-[var(--text-muted)] mb-4">No slides yet.</p>
        <Button onClick={addSlide} className="cursor-pointer">
          <Plus className="w-4 h-4" />
          Add first slide
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-18rem)] min-h-[420px]">
      {/* Slide list */}
      <aside className="w-56 shrink-0 flex flex-col border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
        <div className="p-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Slides</span>
          <button
            type="button"
            onClick={addSlide}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--accent)] cursor-pointer"
            title="Add slide"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <ul className="flex-1 overflow-auto p-1 space-y-0.5">
          {slides.map((slide, i) => (
            <li key={slide.id}>
              <div
                className={`flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer border transition-[var(--transition)] ${
                  i === selectedIndex
                    ? "bg-[var(--accent)]/15 border-[var(--accent)]"
                    : "border-transparent hover:bg-[var(--bg-hover)]"
                }`}
                onClick={() => setSelectedIndex(i)}
              >
                <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span className="flex-1 min-w-0 text-xs truncate text-[var(--text-primary)]">
                  {slide.title || `Slide ${i + 1}`}
                </span>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(i);
                    }}
                    className="p-0.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(i);
                    }}
                    disabled={slides.length <= 1}
                    className="p-0.5 rounded hover:bg-[var(--accent-red)]/20 text-[var(--text-muted)] disabled:opacity-40 cursor-pointer"
                    title="Remove slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-2 border-t border-[var(--border)] flex gap-1">
          <button
            type="button"
            onClick={() => selectedIndex > 0 && moveSlide(selectedIndex, selectedIndex - 1)}
            disabled={selectedIndex <= 0}
            className="flex-1 py-1 text-xs rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] disabled:opacity-40 cursor-pointer"
          >
            Up
          </button>
          <button
            type="button"
            onClick={() =>
              selectedIndex < slides.length - 1 && moveSlide(selectedIndex, selectedIndex + 1)
            }
            disabled={selectedIndex >= slides.length - 1}
            className="flex-1 py-1 text-xs rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] disabled:opacity-40 cursor-pointer"
          >
            Down
          </button>
        </div>
        {slides.length < 9 && (
          <p className="px-2 pb-2 text-[10px] text-[var(--text-muted)]">
            Recommended: at least 9 slides for a full proposal.
          </p>
        )}
      </aside>

      {/* Selected slide editor */}
      <div className="flex-1 min-w-0 flex flex-col border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
        <div className="p-3 border-b border-[var(--border)]">
          <input
            type="text"
            value={selectedSlide?.title ?? ""}
            onChange={(e) => updateSlide(selectedIndex, { title: e.target.value })}
            placeholder="Slide title"
            className="w-full px-3 py-2 text-lg font-medium rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {(selectedSlide?.blocks ?? []).map((block, bi) => (
            <ProposalSlideBlockEditor
              key={block.id}
              block={block}
              onUpdate={(u) => updateBlock(bi, u)}
              onRemove={() => removeBlock(bi)}
              onMoveUp={() => moveBlock(bi, -1)}
              onMoveDown={() => moveBlock(bi, 1)}
              canMoveUp={bi > 0}
              canMoveDown={bi < (selectedSlide?.blocks?.length ?? 0) - 1}
            />
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-[var(--text-muted)] self-center">Add block:</span>
            {(["paragraph", "heading", "bullets", "numbered", "image"] as const).map((type) => (
              <Button
                key={type}
                variant="secondary"
                onClick={() => addBlock(type)}
                className="cursor-pointer text-xs py-1 px-2"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
