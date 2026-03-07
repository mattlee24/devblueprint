"use client";

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import type { Blueprint as BlueprintType, Feature, Milestone, Risk, FeatureDependency, SuggestedIntegration } from "@/lib/types";
import {
  countBlueprintSections,
  totalEstimatedDays,
  BLUEPRINT_SECTION_IDS,
  BLUEPRINT_SECTION_LABELS,
} from "@/lib/blueprint";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { FileText, ChevronDown, ChevronUp, Link2 } from "lucide-react";

const SUMMARY_TRUNCATE_LEN = 300;

interface BlueprintTabProps {
  blueprint: BlueprintType | null;
  projectId?: string;
  projectUpdatedAt?: string;
  onTaskCreate?: (task: {
    title: string;
    description?: string | null;
    status: string;
    priority?: string;
    category?: string;
    effort?: string;
    due_date?: string | null;
    position?: number;
  }) => Promise<void>;
  defaultTaskStatus?: string;
  taskCount?: number;
}

export function BlueprintTab({
  blueprint,
  projectId,
  projectUpdatedAt,
  onTaskCreate,
  defaultTaskStatus = "todo",
  taskCount = 0,
}: BlueprintTabProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [activeSection, setActiveSection] = useState<number>(1);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [expandedMitigation, setExpandedMitigation] = useState<Set<number>>(() => {
    const high = new Set<number>();
    blueprint?.riskFactors?.forEach((r, i) => { if (r.level === "high") high.add(i); });
    return high;
  });
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const toggleSection = useCallback((n: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedSections(new Set([1, 2, 3, 4, 5, 6, 7]));
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const scrollToSection = useCallback((n: number) => {
    const el = document.getElementById(BLUEPRINT_SECTION_IDS[n - 1]);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          const idx = BLUEPRINT_SECTION_IDS.indexOf(id as typeof BLUEPRINT_SECTION_IDS[number]);
          if (idx >= 0) setActiveSection(idx + 1);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [blueprint]);

  if (!blueprint) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-500">
        No blueprint data.
      </div>
    );
  }

  const {
    technicalRequirements,
    coreFeatures,
    suggestedImprovements,
    riskFactors,
    milestones,
    featureDependencies,
    integrations,
    summary,
  } = blueprint;

  const sectionCount = countBlueprintSections(blueprint);
  const estimatedDays = totalEstimatedDays(coreFeatures);
  const phasesCount = milestones?.length ?? 0;

  const summaryTruncated = summary.length > SUMMARY_TRUNCATE_LEN && !summaryExpanded;
  const summaryText = summaryTruncated ? summary.slice(0, SUMMARY_TRUNCATE_LEN) + "…" : summary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
      {/* Left column: header + toolbar + sections */}
      <div className="min-w-0">
        {/* Header panel */}
        <div className="rounded-2xl overflow-hidden bg-[#0f172a] text-white mb-6">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-400" />
              <span className="text-sm font-semibold">Blueprint</span>
            </div>
            {projectUpdatedAt && (
              <span className="text-xs font-mono text-neutral-400">
                Last updated: {formatDate(projectUpdatedAt)}
              </span>
            )}
          </div>
          <div className="border-t border-neutral-700/50 px-6 py-4">
            <p className="text-sm text-neutral-200 leading-relaxed max-w-2xl">
              {summaryText}
              {summary.length > SUMMARY_TRUNCATE_LEN && (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((e) => !e)}
                  className="ml-1 text-teal-400 hover:text-teal-300 text-sm font-medium"
                >
                  {summaryExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg bg-white/5 px-4 py-3">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Sections</p>
                <p className="text-lg font-semibold font-mono mt-0.5">{sectionCount}</p>
              </div>
              <div className="rounded-lg bg-white/5 px-4 py-3">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Estimated</p>
                <p className="text-lg font-semibold font-mono mt-0.5">
                  {estimatedDays != null ? `~${estimatedDays} days` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-4 py-3">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Phases</p>
                <p className="text-lg font-semibold font-mono mt-0.5">{phasesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={collapseAll}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition"
            >
              Collapse all
            </button>
            <span className="text-neutral-300">·</span>
            <button
              type="button"
              onClick={expandAll}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition"
            >
              Expand all
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-sm px-3 py-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 transition"
            >
              <Link2 className="w-4 h-4" />
              Copy link
            </button>
          </div>
        </div>

        {/* Sections */}
        {technicalRequirements.length > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[0]}
            sectionNumber={1}
            title={BLUEPRINT_SECTION_LABELS[0]}
            countLabel={`${technicalRequirements.length} items`}
            collapsed={collapsedSections.has(1)}
            onToggle={() => toggleSection(1)}
            ref={(el) => { sectionRefs.current[0] = el; }}
          >
            <ul className="space-y-0">
              {technicalRequirements.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 py-2 border-b border-neutral-100 last:border-0"
                >
                  <span className="w-4 h-4 rounded border-2 border-neutral-300 flex-shrink-0 mt-0.5" aria-hidden />
                  <span className="text-sm text-neutral-700 leading-relaxed">{r.text}</span>
                </li>
              ))}
            </ul>
          </BlueprintSection>
        )}

        {coreFeatures.length > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[1]}
            sectionNumber={2}
            title={BLUEPRINT_SECTION_LABELS[1]}
            countLabel={`${coreFeatures.length} features`}
            collapsed={collapsedSections.has(2)}
            onToggle={() => toggleSection(2)}
            ref={(el) => { sectionRefs.current[1] = el; }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreFeatures.map((f, i) => (
                <FeatureCard
                  key={i}
                  feature={f}
                  index={i}
                  expandedStories={expandedStories}
                  onToggleStories={() => {
                    setExpandedStories((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    });
                  }}
                />
              ))}
            </div>
            {estimatedDays != null && (
              <p className="text-xs text-neutral-400 font-mono mt-4 text-right">
                Total estimated: ~{estimatedDays} days
              </p>
            )}
          </BlueprintSection>
        )}

        {milestones && milestones.length > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[2]}
            sectionNumber={3}
            title={BLUEPRINT_SECTION_LABELS[2]}
            countLabel={`${milestones.length} phases`}
            collapsed={collapsedSections.has(3)}
            onToggle={() => toggleSection(3)}
            ref={(el) => { sectionRefs.current[2] = el; }}
          >
            <MilestoneTimeline milestones={milestones} />
          </BlueprintSection>
        )}

        {suggestedImprovements.length > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[3]}
            sectionNumber={4}
            title={BLUEPRINT_SECTION_LABELS[3]}
            countLabel={`${suggestedImprovements.length} items`}
            collapsed={collapsedSections.has(4)}
            onToggle={() => toggleSection(4)}
            ref={(el) => { sectionRefs.current[3] = el; }}
          >
            <SuggestedImprovementsList
              items={suggestedImprovements}
              onAddAsTask={onTaskCreate ? async (title) => {
                try {
                  await onTaskCreate({
                    title,
                    description: null,
                    status: defaultTaskStatus,
                    priority: "p2",
                    category: "other",
                    effort: "medium",
                    due_date: null,
                    position: taskCount,
                  });
                  toast.success("Added as task");
                } catch (e) {
                  toast.error("Failed to add task");
                }
              } : undefined}
            />
          </BlueprintSection>
        )}

        {riskFactors.length > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[4]}
            sectionNumber={5}
            title={BLUEPRINT_SECTION_LABELS[4]}
            countLabel={`${riskFactors.length} risks`}
            collapsed={collapsedSections.has(5)}
            onToggle={() => toggleSection(5)}
            ref={(el) => { sectionRefs.current[4] = el; }}
          >
            <RiskCards
              risks={riskFactors}
              expandedMitigation={expandedMitigation}
              onToggleMitigation={(i) => {
                setExpandedMitigation((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                });
              }}
            />
          </BlueprintSection>
        )}

        {(featureDependencies?.length ?? 0) > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[5]}
            sectionNumber={6}
            title={BLUEPRINT_SECTION_LABELS[5]}
            countLabel={`${featureDependencies!.length} dependencies`}
            collapsed={collapsedSections.has(6)}
            onToggle={() => toggleSection(6)}
            ref={(el) => { sectionRefs.current[5] = el; }}
          >
            <DependencyTable dependencies={featureDependencies!} />
          </BlueprintSection>
        )}

        {(integrations?.length ?? 0) > 0 && (
          <BlueprintSection
            id={BLUEPRINT_SECTION_IDS[6]}
            sectionNumber={7}
            title={BLUEPRINT_SECTION_LABELS[6]}
            countLabel={`${integrations!.length} integrations`}
            collapsed={collapsedSections.has(7)}
            onToggle={() => toggleSection(7)}
            ref={(el) => { sectionRefs.current[6] = el; }}
          >
            <IntegrationGrid integrations={integrations!} />
          </BlueprintSection>
        )}
      </div>

      {/* Right column: sticky TOC */}
      <div className="hidden lg:block">
        <nav className="sticky top-6 text-xs space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            In this blueprint
          </p>
          {BLUEPRINT_SECTION_LABELS.map((label, i) => {
            const n = i + 1;
            const isActive = activeSection === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => scrollToSection(n)}
                className={`block w-full text-left py-1 flex items-center gap-2 transition ${
                  isActive ? "text-teal-500 font-medium" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <span className="flex-shrink-0">{isActive ? "●" : "○"}</span>
                <span className="truncate">{n}. {label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Shared section wrapper with collapse
const BlueprintSection = forwardRef<HTMLElement, {
  id: string;
  sectionNumber: number;
  title: string;
  countLabel: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}>(function BlueprintSection(
  { id, sectionNumber, title, countLabel, collapsed, onToggle, children },
  ref
) {
  return (
    <section
      id={id}
      ref={ref}
      className="rounded-2xl border border-neutral-200 bg-white overflow-hidden mb-6"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <span className="text-teal-500 font-mono text-sm font-bold">{sectionNumber}.</span>
          <h3 className="text-base font-semibold font-mono text-neutral-900">{title}</h3>
          <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">
            {countLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
      {!collapsed && <div className="px-6 py-5">{children}</div>}
    </section>
  );
});

function FeatureCard({
  feature,
  index,
  expandedStories,
  onToggleStories,
}: {
  feature: Feature;
  index: number;
  expandedStories: Set<number>;
  onToggleStories: () => void;
}) {
  const hasStories = feature.userStories && feature.userStories.length > 0;
  const expanded = expandedStories.has(index);
  const typeLabel = feature.type === "nice-to-have" ? "Nice to have" : feature.type === "core" ? "Core" : "Advanced";
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            feature.type === "core"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : "bg-neutral-100 text-neutral-600 border-neutral-200"
          }`}
        >
          {typeLabel}
        </span>
        <span className="text-xs font-mono font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
          {feature.effort}
        </span>
      </div>
      <p className="text-sm font-semibold text-neutral-900 mb-1">{feature.name}</p>
      {feature.description && (
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{feature.description}</p>
      )}
      {hasStories && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onToggleStories}
            className="text-xs text-teal-500 hover:text-teal-600 font-medium"
          >
            {feature.userStories!.length} user stories {expanded ? "▴" : "▾"}
          </button>
          {expanded && (
            <ul className="mt-1 space-y-1">
              {feature.userStories!.map((us, j) => (
                <li key={j} className="text-xs text-neutral-500 italic pl-2 border-l-2 border-neutral-200">
                  {us}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative pl-6 border-l-2 border-neutral-200">
      {milestones.map((m, i) => (
        <div key={i} className="relative mb-6 last:mb-0">
          <span
            className="absolute -left-[1.3rem] top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white ring-2 ring-teal-200"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-900">{m.name}</p>
            {m.target && (
              <span className="text-xs font-mono text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full flex-shrink-0">
                {m.target}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed mt-1">{m.description}</p>
        </div>
      ))}
    </div>
  );
}

function SuggestedImprovementsList({
  items,
  onAddAsTask,
}: {
  items: string[];
  onAddAsTask?: (title: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState<number | null>(null);
  return (
    <ul className="space-y-0">
      {items.map((s, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-100 last:border-0 group"
        >
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-teal-400 font-bold text-base mt-0.5 flex-shrink-0">→</span>
            <span className="text-sm text-neutral-700">{s}</span>
          </div>
          {onAddAsTask && (
            <button
              type="button"
              onClick={async () => {
                setAdding(i);
                await onAddAsTask(s);
                setAdding(null);
              }}
              disabled={adding === i}
              className="text-xs text-teal-500 hover:text-teal-700 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
            >
              + Add as task
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function RiskCards({
  risks,
  expandedMitigation,
  onToggleMitigation,
}: {
  risks: Risk[];
  expandedMitigation: Set<number>;
  onToggleMitigation: (i: number) => void;
}) {
  return (
    <div className="space-y-3">
      {risks.map((r, i) => {
        const expanded = expandedMitigation.has(i);
        const borderClass =
          r.level === "high"
            ? "border-l-4 border-red-500 bg-red-50/50"
            : r.level === "medium"
              ? "border-l-4 border-amber-400 bg-amber-50/50"
              : "border-l-4 border-green-500 bg-green-50/50";
        const severityColor =
          r.level === "high" ? "text-red-600" : r.level === "medium" ? "text-amber-600" : "text-green-600";
        return (
          <div key={i} className={`rounded-lg p-4 ${borderClass}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${severityColor}`}>
                {r.level === "high" ? "High" : r.level === "medium" ? "Medium" : "Low"}
              </span>
              {r.mitigation && (
                <button
                  type="button"
                  onClick={() => onToggleMitigation(i)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  {expanded ? "Hide ▴" : "Show mitigation ▾"}
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-800 mt-1">{r.description}</p>
            {r.mitigation && expanded && (
              <div className="text-xs text-neutral-500 leading-relaxed mt-2 pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-600">Mitigation:</span> {r.mitigation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DependencyTable({ dependencies }: { dependencies: FeatureDependency[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-widest text-neutral-400 border-b border-neutral-200 pb-2 mb-1">
          <th className="text-left py-2 font-semibold">Feature</th>
          <th className="w-8" />
          <th className="text-left font-semibold">Depends On</th>
        </tr>
      </thead>
      <tbody>
        {dependencies.map((d, i) => (
          <tr key={i} className={`border-b border-neutral-100 last:border-0 ${i % 2 === 1 ? "bg-neutral-50/50" : ""}`}>
            <td className="py-2 font-semibold text-neutral-800">{d.feature}</td>
            <td className="py-2 text-neutral-400 px-1">→</td>
            <td className="py-2 text-neutral-500">{d.dependsOn}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IntegrationGrid({ integrations }: { integrations: SuggestedIntegration[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {integrations.map((int, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center mb-3 text-sm font-semibold text-neutral-600">
            {int.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-neutral-900">{int.name}</p>
          {int.purpose && <p className="text-xs text-neutral-500 leading-relaxed mt-1">{int.purpose}</p>}
        </div>
      ))}
    </div>
  );
}

