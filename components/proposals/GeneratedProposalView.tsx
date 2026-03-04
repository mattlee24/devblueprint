"use client";

import type { GeneratedProposalContent } from "@/lib/queries/proposals";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GeneratedProposalViewProps {
  content: GeneratedProposalContent;
  editable?: boolean;
  onContentChange?: (content: GeneratedProposalContent) => void;
}

export function GeneratedProposalView({
  content,
  editable = false,
  onContentChange,
}: GeneratedProposalViewProps) {
  const update = (patch: Partial<GeneratedProposalContent>) => {
    if (!onContentChange) return;
    onContentChange({ ...content, ...patch });
  };

  const listKeys = ["objectives", "deliverables", "success_metrics"] as const;
  const updateList = (
    key: (typeof listKeys)[number],
    value: string[]
  ) => {
    if (!onContentChange) return;
    onContentChange({ ...content, [key]: value });
  };

  const addListItem = (key: (typeof listKeys)[number], emptyItem: string) => {
    const arr = content[key] ?? [];
    updateList(key, [...arr, emptyItem]);
  };

  const setListItem = (
    key: (typeof listKeys)[number],
    index: number,
    value: string
  ) => {
    const arr = [...(content[key] ?? [])];
    arr[index] = value;
    updateList(key, arr);
  };

  const removeListItem = (key: (typeof listKeys)[number], index: number) => {
    const arr = (content[key] ?? []).filter((_, i) => i !== index);
    updateList(key, arr);
  };

  const timeline = content.timeline ?? [];
  const budget = content.budget_estimates ?? [];
  const team = content.team_structure ?? [];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Executive summary */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Executive summary
        </h2>
        {editable && onContentChange ? (
          <textarea
            value={content.executive_summary ?? ""}
            onChange={(e) => update({ executive_summary: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none text-sm"
            placeholder="Executive summary..."
          />
        ) : (
          <p className="text-[var(--text-primary)] leading-relaxed">
            {content.executive_summary || "—"}
          </p>
        )}
      </section>

      {/* Objectives */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Objectives
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-2">
            {(content.objectives ?? []).map((o, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[var(--accent-green)] shrink-0 mt-1.5">•</span>
                <input
                  value={o}
                  onChange={(e) => setListItem("objectives", i, e.target.value)}
                  className="flex-1 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("objectives", i)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() => addListItem("objectives", "")}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add objective
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2">
            {(content.objectives ?? []).map((o, i) => (
              <li key={i} className="flex gap-2 text-[var(--text-secondary)]">
                <span className="text-[var(--accent-green)] shrink-0">•</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Deliverables */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Deliverables
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-2">
            {(content.deliverables ?? []).map((d, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[var(--accent-green)] shrink-0 mt-1.5">•</span>
                <input
                  value={d}
                  onChange={(e) => setListItem("deliverables", i, e.target.value)}
                  className="flex-1 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("deliverables", i)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() => addListItem("deliverables", "")}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add deliverable
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2">
            {(content.deliverables ?? []).map((d, i) => (
              <li key={i} className="flex gap-2 text-[var(--text-secondary)]">
                <span className="text-[var(--accent-green)] shrink-0">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Timeline */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Timeline
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-4">
            {timeline.map((t, i) => (
              <li key={i} className="border-l-2 border-[var(--border)] pl-4 space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    value={t.phase}
                    onChange={(e) => {
                      const next = [...timeline];
                      next[i] = { ...next[i]!, phase: e.target.value, duration: next[i]!.duration, description: next[i]!.description };
                      update({ timeline: next });
                    }}
                    placeholder="Phase"
                    className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm font-medium"
                  />
                  <input
                    value={t.duration}
                    onChange={(e) => {
                      const next = [...timeline];
                      next[i] = { ...next[i]!, duration: e.target.value, phase: next[i]!.phase, description: next[i]!.description };
                      update({ timeline: next });
                    }}
                    placeholder="Duration"
                    className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                  />
                  <textarea
                    value={t.description}
                    onChange={(e) => {
                      const next = [...timeline];
                      next[i] = { ...next[i]!, description: e.target.value, phase: next[i]!.phase, duration: next[i]!.duration };
                      update({ timeline: next });
                    }}
                    placeholder="Description"
                    rows={2}
                    className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => update({ timeline: timeline.filter((_, j) => j !== i) })}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                >
                  Remove phase
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() =>
                  update({
                    timeline: [...timeline, { phase: "", duration: "", description: "" }],
                  })
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add phase
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-4">
            {timeline.map((t, i) => (
              <li key={i} className="border-l-2 border-[var(--border)] pl-4">
                <p className="font-medium text-[var(--text-primary)]">{t.phase}</p>
                <p className="text-sm text-[var(--text-muted)]">{t.duration}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Budget estimates */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Budget estimates
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-3">
            {budget.map((b, i) => (
              <li key={i} className="flex justify-between gap-4 py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex-1 grid grid-cols-1 gap-1">
                  <input
                    value={b.item}
                    onChange={(e) => {
                      const next = budget.map((x, j) =>
                        j === i ? { ...x, item: e.target.value } : x
                      );
                      update({ budget_estimates: next });
                    }}
                    placeholder="Item"
                    className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                  />
                  <input
                    value={b.notes ?? ""}
                    onChange={(e) => {
                      const next = budget.map((x, j) =>
                        j === i ? { ...x, notes: e.target.value } : x
                      );
                      update({ budget_estimates: next });
                    }}
                    placeholder="Notes"
                    className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs"
                  />
                </div>
                <input
                  value={b.estimate}
                  onChange={(e) => {
                    const next = budget.map((x, j) =>
                      j === i ? { ...x, estimate: e.target.value } : x
                    );
                    update({ budget_estimates: next });
                  }}
                  placeholder="Estimate"
                  className="w-24 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm shrink-0"
                />
                <button
                  type="button"
                  onClick={() =>
                    update({ budget_estimates: budget.filter((_, j) => j !== i) })
                  }
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)] shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() =>
                  update({
                    budget_estimates: [...budget, { item: "", estimate: "", notes: "" }],
                  })
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add line item
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-3">
            {budget.map((b, i) => (
              <li
                key={i}
                className="flex justify-between gap-4 py-2 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-[var(--text-primary)]">{b.item}</p>
                  {b.notes && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{b.notes}</p>
                  )}
                </div>
                <span className="text-[var(--text-secondary)] shrink-0">{b.estimate}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Team structure */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Team structure
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-3">
            {team.map((t, i) => (
              <li key={i} className="py-2 border-b border-[var(--border)] last:border-0 space-y-2">
                <input
                  value={t.role}
                  onChange={(e) => {
                    const next = team.map((x, j) =>
                      j === i ? { ...x, role: e.target.value } : x
                    );
                    update({ team_structure: next });
                  }}
                  placeholder="Role"
                  className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm font-medium"
                />
                <input
                  value={t.responsibility}
                  onChange={(e) => {
                    const next = team.map((x, j) =>
                      j === i ? { ...x, responsibility: e.target.value } : x
                    );
                    update({ team_structure: next });
                  }}
                  placeholder="Responsibility"
                  className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    update({ team_structure: team.filter((_, j) => j !== i) })
                  }
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                >
                  Remove role
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() =>
                  update({
                    team_structure: [...team, { role: "", responsibility: "" }],
                  })
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add role
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-3">
            {team.map((t, i) => (
              <li
                key={i}
                className="py-2 border-b border-[var(--border)] last:border-0"
              >
                <p className="font-medium text-[var(--text-primary)]">{t.role}</p>
                <p className="text-sm text-[var(--text-secondary)]">{t.responsibility}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Success metrics */}
      <section className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Success metrics
        </h2>
        {editable && onContentChange ? (
          <ul className="space-y-2">
            {(content.success_metrics ?? []).map((m, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[var(--accent-green)] shrink-0 mt-1.5">•</span>
                <input
                  value={m}
                  onChange={(e) => setListItem("success_metrics", i, e.target.value)}
                  className="flex-1 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("success_metrics", i)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="text-sm py-1 text-[var(--text-muted)]"
                onClick={() => addListItem("success_metrics", "")}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add metric
              </Button>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2">
            {(content.success_metrics ?? []).map((m, i) => (
              <li key={i} className="flex gap-2 text-[var(--text-secondary)]">
                <span className="text-[var(--accent-green)] shrink-0">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
