"use client";

import React, { useCallback, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type {
  ProposalSlide,
  ProposalSlideBlock,
  ProposalSlideBlockType,
} from "@/lib/queries/proposals";
import { Plus, Trash2, GripVertical, Copy, Type, Heading1, List, ListOrdered, Image as ImageIcon } from "lucide-react";
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

const BLOCK_TYPE_ICONS: Record<ProposalSlideBlockType, React.ReactNode> = {
  paragraph: <Type className="w-4 h-4" />,
  heading: <Heading1 className="w-4 h-4" />,
  bullets: <List className="w-4 h-4" />,
  numbered: <ListOrdered className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
};

export function ProposalDeckEditor({
  slides,
  onSlidesChange,
}: ProposalDeckEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastAddedBlockType, setLastAddedBlockType] = useState<ProposalSlideBlockType | null>(null);
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

  const onSlideDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || result.destination.index === result.source.index) return;
      const next = [...slides];
      const [removed] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, removed);
      updateSlides(next.map((s, i) => ({ ...s, order: i })));
      setSelectedIndex(result.destination.index);
    },
    [slides, updateSlides]
  );

  const addBlock = useCallback(
    (type: ProposalSlideBlockType = "paragraph") => {
      if (selectedSlide == null) return;
      setLastAddedBlockType(type);
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

  const onBlockDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || result.destination.index === result.source.index || !selectedSlide) return;
      const blocks = [...(selectedSlide.blocks ?? [])];
      const [removed] = blocks.splice(result.source.index, 1);
      blocks.splice(result.destination.index, 0, removed);
      updateSlide(selectedIndex, { blocks });
    },
    [selectedSlide, selectedIndex, updateSlide]
  );

  if (slides.length === 0) {
    return (
      <div className="proposal-editor rounded-2xl border border-[#E8E8E8] p-8 bg-white text-center">
        <p className="text-[#4A4A4A] mb-4">No slides yet.</p>
        <Button onClick={addSlide} className="cursor-pointer bg-teal-500 hover:bg-teal-600 text-white">
          <Plus className="w-4 h-4" />
          Add first slide
        </Button>
      </div>
    );
  }

  const blocks = selectedSlide?.blocks ?? [];

  return (
    <div className="proposal-editor flex gap-6 h-[calc(100vh-18rem)] min-h-[420px] rounded-2xl p-4 bg-[var(--proposal-shell-bg,#F0EFED)]">
      {/* Slide list sidebar */}
      <aside className="w-56 shrink-0 flex flex-col rounded-xl border border-[#E8E8E8] bg-white overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[#E8E8E8]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">Slides</span>
        </div>
        <DragDropContext onDragEnd={onSlideDragEnd}>
          <Droppable droppableId="proposal-slides">
            {(provided) => (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 overflow-auto p-2 space-y-0"
              >
                {slides.map((slide, i) => (
                  <Draggable key={slide.id} draggableId={slide.id} index={i}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border-b border-[#F0F0F0] last:border-b-0"
                      >
                        <div
                          className={`group flex items-center gap-2 rounded-lg px-2 py-2.5 cursor-pointer transition-all duration-200 ${
                            i === selectedIndex
                              ? "bg-teal-50 border-l-2 border-teal-500 pl-[calc(0.5rem-2px)]"
                              : "border-l-2 border-transparent hover:bg-neutral-100"
                          }`}
                          onClick={() => setSelectedIndex(i)}
                          style={{ ...provided.draggableProps.style }}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 touch-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-3.5 h-3.5 text-[#94a3b8]" />
                          </div>
                          <span className="flex-1 min-w-0 text-sm font-medium text-[#1A1A1A] truncate">
                            {slide.title || `Slide ${i + 1}`}
                          </span>
                          <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSlide(i);
                              }}
                              className="p-1 rounded hover:bg-neutral-200 text-[#64748b] cursor-pointer"
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
                              className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-[#64748b] disabled:opacity-40 cursor-pointer"
                              title="Remove slide"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div className="p-2 border-t border-[#E8E8E8]">
          <button
            type="button"
            onClick={addSlide}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add slide
          </button>
        </div>
        {slides.length < 9 && (
          <p className="px-3 pb-3 text-[10px] text-[#94a3b8]">
            Recommended: at least 9 slides for a full proposal.
          </p>
        )}
      </aside>

      {/* Content canvas */}
      <div className="flex-1 min-w-0 flex flex-col rounded-xl border border-[#E8E8E8] bg-[var(--proposal-canvas-bg,#F9F7F4)] overflow-hidden shadow-sm">
        {/* Progress bar */}
        <div className="shrink-0 px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-xs text-[#4A4A4A] mb-1">
            <span>Slide {selectedIndex + 1} of {slides.length}</span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-200"
              style={{ width: `${((selectedIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Slide title (large document heading) */}
        <div className="shrink-0 px-6 pt-2 pb-4">
          <input
            type="text"
            value={selectedSlide?.title ?? ""}
            onChange={(e) => updateSlide(selectedIndex, { title: e.target.value })}
            placeholder="Slide title"
            className="w-full px-0 py-1 text-2xl font-semibold bg-transparent border-0 border-b border-transparent text-[#1A1A1A] placeholder:text-[#94a3b8] focus:outline-none focus:ring-0 focus:border-b focus:border-[#CBD5E1] rounded-none"
          />
        </div>

        {/* Block list with DnD */}
        <div className="flex-1 overflow-auto px-6 pb-6 space-y-4">
          <DragDropContext onDragEnd={onBlockDragEnd}>
            <Droppable droppableId="proposal-blocks">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {blocks.map((block, bi) => (
                    <Draggable key={block.id} draggableId={block.id} index={bi}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <ProposalSlideBlockEditor
                            block={block}
                            onUpdate={(u) => updateBlock(bi, u)}
                            onRemove={() => removeBlock(bi)}
                            dragHandleProps={provided.dragHandleProps as React.HTMLAttributes<HTMLDivElement> | undefined}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Insert block toolbar */}
          <div className="pt-4 mt-4 border-t border-[#E8E8E8]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
              Insert block
            </p>
            <div className="flex flex-wrap gap-2">
              {(["paragraph", "heading", "bullets", "numbered", "image"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${
                    lastAddedBlockType === type
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-[#E8E8E8] bg-white text-[#4A4A4A] hover:border-[#CBD5E1] hover:bg-[#F9F7F4]"
                  }`}
                >
                  {BLOCK_TYPE_ICONS[type]}
                  {type === "numbered" ? "Numbered list" : type === "image" ? "Image (URL)" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
