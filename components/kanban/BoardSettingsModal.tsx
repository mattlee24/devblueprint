"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { BoardConfig, BoardConfigOption } from "@/lib/queries/projects";
import { Plus, Pencil, Trash2 } from "lucide-react";

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

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

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
  const [categories, setCategories] = useState<BoardConfigOption[]>(DEFAULT_CATEGORIES);
  const [priorities, setPriorities] = useState<BoardConfigOption[]>(DEFAULT_PRIORITIES);
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingPriIdx, setEditingPriIdx] = useState<number | null>(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editPriLabel, setEditPriLabel] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newPriLabel, setNewPriLabel] = useState("");

  useEffect(() => {
    if (open) {
      setCategories(boardConfig?.categories?.length ? boardConfig.categories : DEFAULT_CATEGORIES);
      setPriorities(boardConfig?.priorities?.length ? boardConfig.priorities : DEFAULT_PRIORITIES);
      setEditingCatIdx(null);
      setEditingPriIdx(null);
      setEditCatLabel("");
      setEditPriLabel("");
      setNewCatLabel("");
      setNewPriLabel("");
    }
  }, [open, boardConfig]);

  function handleSave() {
    onSave({
      ...boardConfig,
      columnOrder: boardConfig?.columnOrder,
      columnLabels: boardConfig?.columnLabels,
      categories,
      priorities,
    });
    onClose();
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
    setPriorities((prev) => prev.filter((_, i) => i !== idx));
    setEditingPriIdx(null);
  }

  return (
    <Modal open={open} onClose={onClose} title="Board settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Categories</h3>
          <ul className="space-y-2 mb-2">
            {categories.map((c, i) => (
              <li key={c.value} className="flex items-center gap-2">
                {editingCatIdx === i ? (
                  <>
                    <Input
                      value={editCatLabel}
                      onChange={(e) => setEditCatLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateCategory(i, editCatLabel);
                        if (e.key === "Escape") setEditingCatIdx(null);
                      }}
                      className="flex-1 py-1.5 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" className="shrink-0" onClick={() => updateCategory(i, editCatLabel)}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[var(--text-primary)]">{c.label}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingCatIdx(i); setEditCatLabel(c.label); }}
                      className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] cursor-pointer"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(i)}
                      className="p-1 rounded text-[var(--accent-red)] hover:bg-[var(--bg-hover)] cursor-pointer"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              placeholder="New category name"
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <Button variant="secondary" onClick={addCategory} disabled={!newCatLabel.trim()}>
              <Plus className="w-4 h-4 shrink-0" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Priorities</h3>
          <ul className="space-y-2 mb-2">
            {priorities.map((p, i) => (
              <li key={p.value} className="flex items-center gap-2">
                {editingPriIdx === i ? (
                  <>
                    <Input
                      value={editPriLabel}
                      onChange={(e) => setEditPriLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updatePriority(i, editPriLabel);
                        if (e.key === "Escape") setEditingPriIdx(null);
                      }}
                      className="flex-1 py-1.5 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" className="shrink-0" onClick={() => updatePriority(i, editPriLabel)}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[var(--text-primary)]">{p.label}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingPriIdx(i); setEditPriLabel(p.label); }}
                      className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] cursor-pointer"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePriority(i)}
                      className="p-1 rounded text-[var(--accent-red)] hover:bg-[var(--bg-hover)] cursor-pointer"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={newPriLabel}
              onChange={(e) => setNewPriLabel(e.target.value)}
              placeholder="New priority name"
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addPriority()}
            />
            <Button variant="secondary" onClick={addPriority} disabled={!newPriLabel.trim()}>
              <Plus className="w-4 h-4 shrink-0" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
          <Button onClick={handleSave}>Save settings</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
