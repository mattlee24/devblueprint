"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { BoardConfig, BoardConfigOption } from "@/lib/queries/projects";
import { Plus, Pencil, Trash2, GripVertical, Check, X } from "lucide-react";

const DEFAULT_CATEGORIES: BoardConfigOption[] = [
  { value: "dev", label: "Dev" },
  { value: "design", label: "Design" },
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "devops", label: "DevOps" },
  { value: "testing", label: "Testing" },
  { value: "other", label: "Other" },
];

const DEFAULT_PRIORITIES: BoardConfigOption[] = [
  { value: "p1", label: "P1 – High" },
  { value: "p2", label: "P2 – Medium" },
  { value: "p3", label: "P3 – Low" },
];

const DEFAULT_STAGES: { id: string; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "in_review", label: "In review" },
  { id: "done", label: "Done" },
];

const PRIORITY_COLOR_PRESETS: { key: string; label: string; class: string }[] = [
  { key: "red", label: "Red", class: "bg-red-500" },
  { key: "orange", label: "Orange", class: "bg-orange-500" },
  { key: "amber", label: "Amber", class: "bg-amber-400" },
  { key: "green", label: "Green", class: "bg-green-500" },
  { key: "blue", label: "Blue", class: "bg-blue-500" },
  { key: "purple", label: "Purple", class: "bg-purple-500" },
  { key: "teal", label: "Teal", class: "bg-teal-500" },
  { key: "neutral", label: "Neutral", class: "bg-neutral-400" },
];

const COLOR_CLASS_MAP: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-400",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  neutral: "bg-neutral-400",
};

const DEFAULT_PRIORITY_COLORS: Record<string, string> = {
  p1: "red",
  p2: "amber",
  p3: "green",
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

type TabId = "stages" | "categories" | "priorities";

interface BoardSettingsModalProps {
  open: boolean;
  onClose: () => void;
  boardConfig: BoardConfig | null;
  onSave: (config: BoardConfig) => void;
}

export function BoardSettingsModal({
  open,
  onClose,
  boardConfig,
  onSave,
}: BoardSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("stages");
  const [categories, setCategories] = useState<BoardConfigOption[]>(DEFAULT_CATEGORIES);
  const [priorities, setPriorities] = useState<BoardConfigOption[]>(DEFAULT_PRIORITIES);
  const [priorityColors, setPriorityColors] = useState<Record<string, string>>(DEFAULT_PRIORITY_COLORS);
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingPriIdx, setEditingPriIdx] = useState<number | null>(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editPriLabel, setEditPriLabel] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newPriLabel, setNewPriLabel] = useState("");
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_STAGES.map((s) => s.id));
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>(
    Object.fromEntries(DEFAULT_STAGES.map((s) => [s.id, s.label]))
  );
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageLabel, setEditStageLabel] = useState("");
  const [newStageLabel, setNewStageLabel] = useState("");
  const [priorityColorOpen, setPriorityColorOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setCategories(boardConfig?.categories?.length ? boardConfig.categories : DEFAULT_CATEGORIES);
      setPriorities(boardConfig?.priorities?.length ? boardConfig.priorities : DEFAULT_PRIORITIES);
      setPriorityColors(
        boardConfig?.priorityColors && Object.keys(boardConfig.priorityColors).length > 0
          ? { ...DEFAULT_PRIORITY_COLORS, ...boardConfig.priorityColors }
          : DEFAULT_PRIORITY_COLORS
      );
      const order = boardConfig?.columnOrder?.length ? boardConfig.columnOrder : DEFAULT_STAGES.map((s) => s.id);
      const labels =
        boardConfig?.columnLabels && Object.keys(boardConfig.columnLabels).length > 0
          ? boardConfig.columnLabels
          : Object.fromEntries(DEFAULT_STAGES.map((s) => [s.id, s.label]));
      setColumnOrder(order);
      setColumnLabels(labels);
      setEditingCatIdx(null);
      setEditingPriIdx(null);
      setEditingStageId(null);
      setEditCatLabel("");
      setEditPriLabel("");
      setEditStageLabel("");
      setNewCatLabel("");
      setNewPriLabel("");
      setPriorityColorOpen(null);
    }
  }, [open, boardConfig]);

  function handleSave() {
    onSave({
      ...boardConfig,
      columnOrder,
      columnLabels,
      categories,
      priorities,
      priorityColors,
    });
    onClose();
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return next;
    });
  }

  function addStage() {
    const label = newStageLabel.trim();
    if (!label) return;
    const id = slug(label) || `stage_${Date.now()}`;
    if (columnOrder.includes(id)) return;
    setColumnOrder((prev) => [...prev, id]);
    setColumnLabels((prev) => ({ ...prev, [id]: label }));
    setNewStageLabel("");
  }

  function updateStageLabel(stageId: string, label: string) {
    setColumnLabels((prev) => ({ ...prev, [stageId]: label.trim() || prev[stageId] || stageId }));
    setEditingStageId(null);
    setEditStageLabel("");
  }

  function removeStage(stageId: string) {
    if (columnOrder.length <= 1) return;
    setColumnOrder((prev) => prev.filter((id) => id !== stageId));
    setColumnLabels((prev) => {
      const next = { ...prev };
      delete next[stageId];
      return next;
    });
    setEditingStageId(null);
  }

  function addCategory() {
    const label = newCatLabel.trim();
    if (!label) return;
    const value = slug(label) || `cat_${Date.now()}`;
    if (categories.some((c) => c.value === value)) return;
    setCategories((prev) => [...prev, { value, label }]);
    setNewCatLabel("");
  }

  function updateCategory(idx: number, label: string) {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, label: label.trim() || c.label } : c))
    );
    setEditingCatIdx(null);
    setEditCatLabel("");
  }

  function removeCategory(idx: number) {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
    setEditingCatIdx(null);
  }

  function addPriority() {
    const label = newPriLabel.trim();
    if (!label) return;
    const value = slug(label) || `pri_${Date.now()}`;
    if (priorities.some((p) => p.value === value)) return;
    setPriorities((prev) => [...prev, { value, label }]);
    setPriorityColors((prev) => ({ ...prev, [value]: "neutral" }));
    setNewPriLabel("");
  }

  function updatePriority(idx: number, label: string) {
    setPriorities((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, label: label.trim() || p.label } : p))
    );
    setEditingPriIdx(null);
    setEditPriLabel("");
  }

  function removePriority(idx: number) {
    const value = priorities[idx]?.value;
    setPriorities((prev) => prev.filter((_, i) => i !== idx));
    if (value)
      setPriorityColors((prev) => {
        const next = { ...prev };
        delete next[value];
        return next;
      });
    setEditingPriIdx(null);
    setPriorityColorOpen(null);
  }

  function setPriorityColor(priorityValue: string, colorKey: string) {
    setPriorityColors((prev) => ({ ...prev, [priorityValue]: colorKey }));
    setPriorityColorOpen(null);
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "stages", label: "Stages" },
    { id: "categories", label: "Categories" },
    { id: "priorities", label: "Priorities" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Board settings"
      contentClassName="max-w-lg rounded-2xl shadow-xl border border-neutral-200 bg-white p-0 overflow-hidden"
      contentInnerClassName="p-0"
    >
      <div className="flex flex-col max-h-[85vh]">
        <div className="flex border-b border-neutral-200 px-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "stages" && (
            <>
              <p className="text-xs text-neutral-500 mb-3">
                Workflow stages define the columns on your task board and available statuses.
              </p>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="stages">
                  {(provided) => (
                    <ul
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {columnOrder.map((id, index) => (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`rounded-lg border bg-white px-3 py-2.5 flex items-center gap-3 transition ${
                                snapshot.isDragging
                                  ? "shadow-lg border-teal-300 bg-teal-50/50 opacity-90"
                                  : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                              }`}
                            >
                              <span
                                {...provided.dragHandleProps}
                                className="text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing w-4 flex-shrink-0"
                                aria-label="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </span>
                              {editingStageId === id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editStageLabel}
                                    onChange={(e) => setEditStageLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") updateStageLabel(id, editStageLabel);
                                      if (e.key === "Escape") setEditingStageId(null);
                                    }}
                                    className="flex-1 text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1 min-w-0"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateStageLabel(id, editStageLabel)}
                                    className="w-7 h-7 rounded hover:bg-teal-100 flex items-center justify-center text-teal-600"
                                    aria-label="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingStageId(null)}
                                    className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400"
                                    aria-label="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 text-sm font-medium text-neutral-800 min-w-0 truncate">
                                    {columnLabels[id] ?? id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStageId(id);
                                      setEditStageLabel(columnLabels[id] ?? id);
                                    }}
                                    className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition"
                                    aria-label="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeStage(id)}
                                    disabled={columnOrder.length <= 1}
                                    className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <input
                  type="text"
                  value={newStageLabel}
                  onChange={(e) => setNewStageLabel(e.target.value)}
                  placeholder="New stage name"
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addStage()}
                />
                <Button
                  onClick={addStage}
                  disabled={!newStageLabel.trim()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shrink-0"
                >
                  <Plus className="w-4 h-4 inline-block mr-1 align-middle" />
                  Add stage
                </Button>
              </div>
            </>
          )}

          {activeTab === "categories" && (
            <>
              <p className="text-xs text-neutral-500 mb-3">
                Categories for grouping and filtering tasks.
              </p>
              <ul className="space-y-2">
                {categories.map((c, i) => (
                  <li
                    key={c.value}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 flex items-center gap-3 hover:border-neutral-300 hover:shadow-sm transition"
                  >
                    <span className="w-4 flex-shrink-0" />
                    {editingCatIdx === i ? (
                      <>
                        <input
                          type="text"
                          value={editCatLabel}
                          onChange={(e) => setEditCatLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateCategory(i, editCatLabel);
                            if (e.key === "Escape") setEditingCatIdx(null);
                          }}
                          className="flex-1 text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1 min-w-0"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => updateCategory(i, editCatLabel)}
                          className="w-7 h-7 rounded hover:bg-teal-100 flex items-center justify-center text-teal-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatIdx(null)}
                          className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-neutral-800">{c.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatIdx(i);
                            setEditCatLabel(c.label);
                          }}
                          className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(i)}
                          className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <input
                  type="text"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Button
                  onClick={addCategory}
                  disabled={!newCatLabel.trim()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shrink-0"
                >
                  <Plus className="w-4 h-4 inline-block mr-1 align-middle" />
                  Add
                </Button>
              </div>
            </>
          )}

          {activeTab === "priorities" && (
            <>
              <p className="text-xs text-neutral-500 mb-3">
                Priority levels with optional colour. Used on task cards and filters.
              </p>
              <ul className="space-y-2">
                {priorities.map((p, i) => {
                  const colorKey = priorityColors[p.value] ?? "neutral";
                  const colorClass = COLOR_CLASS_MAP[colorKey] ?? "bg-neutral-400";
                  return (
                    <li
                      key={p.value}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 flex items-center gap-3 hover:border-neutral-300 hover:shadow-sm transition"
                    >
                      <span className="w-4 flex-shrink-0" />
                      <DropdownMenuPrimitive.Root
                        open={priorityColorOpen === i}
                        onOpenChange={(open) => setPriorityColorOpen(open ? i : null)}
                      >
                        <DropdownMenuPrimitive.Trigger asChild>
                          <button
                            type="button"
                            className={`w-4 h-4 rounded-full flex-shrink-0 border border-neutral-200 ${colorClass} hover:ring-2 hover:ring-neutral-300 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer`}
                            aria-label="Change colour"
                          />
                        </DropdownMenuPrimitive.Trigger>
                        <DropdownMenuPrimitive.Portal>
                          <DropdownMenuPrimitive.Content
                            className="rounded-xl border border-neutral-200 bg-white shadow-lg p-2 z-50 min-w-0"
                            sideOffset={4}
                            align="start"
                          >
                            <div className="grid grid-cols-4 gap-1">
                              {PRIORITY_COLOR_PRESETS.map((preset) => (
                                <button
                                  key={preset.key}
                                  type="button"
                                  onClick={() => setPriorityColor(p.value, preset.key)}
                                  className={`w-7 h-7 rounded-full border-2 ${preset.class} ${
                                    colorKey === preset.key ? "border-neutral-900 ring-2 ring-neutral-300" : "border-transparent"
                                  }`}
                                  title={preset.label}
                                />
                              ))}
                            </div>
                          </DropdownMenuPrimitive.Content>
                        </DropdownMenuPrimitive.Portal>
                      </DropdownMenuPrimitive.Root>
                      {editingPriIdx === i ? (
                        <>
                          <input
                            type="text"
                            value={editPriLabel}
                            onChange={(e) => setEditPriLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") updatePriority(i, editPriLabel);
                              if (e.key === "Escape") setEditingPriIdx(null);
                            }}
                            className="flex-1 text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1 min-w-0"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => updatePriority(i, editPriLabel)}
                            className="w-7 h-7 rounded hover:bg-teal-100 flex items-center justify-center text-teal-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPriIdx(null)}
                            className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium text-neutral-800">{p.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriIdx(i);
                              setEditPriLabel(p.label);
                            }}
                            className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePriority(i)}
                            className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-neutral-300 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <input
                  type="text"
                  value={newPriLabel}
                  onChange={(e) => setNewPriLabel(e.target.value)}
                  placeholder="New priority name"
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addPriority()}
                />
                <Button
                  onClick={addPriority}
                  disabled={!newPriLabel.trim()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shrink-0"
                >
                  <Plus className="w-4 h-4 inline-block mr-1 align-middle" />
                  Add
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50/50">
          <p className="text-xs text-neutral-400">Changes apply immediately to all tasks.</p>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="bg-teal-500 hover:bg-teal-600 text-white">
              Save settings
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
