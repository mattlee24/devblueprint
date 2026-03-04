import type { Blueprint as BlueprintType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const cardClass =
  "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6";

interface BlueprintTabProps {
  blueprint: BlueprintType | null;
}

export function BlueprintTab({ blueprint }: BlueprintTabProps) {
  if (!blueprint) {
    return (
      <div className={`${cardClass} text-[var(--text-muted)]`}>
        No blueprint data.
      </div>
    );
  }

  const {
    technicalRequirements,
    feasibility,
    coreFeatures,
    suggestedImprovements,
    riskFactors,
    milestones,
    featureDependencies,
    integrations,
    scores,
    overallScore,
    summary,
  } = blueprint;

  return (
    <div className="space-y-8">
      {/* Summary and score block */}
      <div className={`${cardClass} text-center`}>
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Overall score</p>
        <p className="text-4xl font-semibold text-[var(--accent)] mb-3">{overallScore.toFixed(1)} / 10</p>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto mb-4">{summary}</p>
        {feasibility && (
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span>
              <span className="text-[var(--text-muted)]">Complexity </span>
              <span className="font-medium">{feasibility.technicalComplexity}/10</span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Resources </span>
              <span className="font-medium">{feasibility.resourceRequirements}/10</span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Time to market </span>
              <span className="font-medium">{feasibility.timeToMarket}/10</span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Scalability </span>
              <span className="font-medium">{feasibility.scalabilityPotential}/10</span>
            </span>
            <Badge variant="default" className="mt-2">
              {feasibility.overallVerdict.replace(/\b\w/g, (c) => c.toUpperCase())} feasibility
            </Badge>
          </div>
        )}
      </div>

      {/* Two-column: Technical requirements + Feasibility detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">1.</span> Technical requirements
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--text-secondary)]">
            {technicalRequirements.map((r, i) => (
              <li key={i}>{r.text}</li>
            ))}
          </ul>
        </div>
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">2.</span> Score breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--text-muted)] text-xs">Clarity of scope</p>
              <p className="font-medium text-[var(--accent)]">{scores.clarityOfScope}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Technical feasibility</p>
              <p className="font-medium text-[var(--accent)]">{scores.technicalFeasibility}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Feature completeness</p>
              <p className="font-medium text-[var(--accent)]">{scores.featureCompleteness}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Risk profile</p>
              <p className="font-medium text-[var(--accent)]">{scores.riskProfile}/10</p>
            </div>
          </div>
          {feasibility?.summary && (
            <p className="text-sm text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border)]">
              {feasibility.summary}
            </p>
          )}
        </div>
      </div>

      {/* Full width: Core features */}
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          <span className="text-[var(--accent)]">3.</span> Core features
        </h3>
        <ul className="space-y-4 text-sm">
          {coreFeatures.map((f, i) => (
            <li key={i} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="default">{f.type === "nice-to-have" ? "Nice to have" : f.type === "core" ? "Core" : "Advanced"}</Badge>
                <span className="text-[var(--text-muted)]">{f.effort}</span>
                <span className="text-[var(--text-primary)] font-medium">{f.name}</span>
              </div>
              {f.description && (
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed mt-1 pl-0">
                  {f.description}
                </p>
              )}
              {f.userStories && f.userStories.length > 0 && (
                <ul className="mt-2 pl-4 space-y-1 text-xs text-[var(--text-secondary)] list-disc">
                  {f.userStories.map((us, j) => (
                    <li key={j}>{us}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {milestones && milestones.length > 0 && (
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">4.</span> Milestones & phases
          </h3>
          <ul className="space-y-3 text-sm">
            {milestones.map((m, i) => (
              <li key={i} className="border-l-2 border-[var(--border)] pl-4">
                <p className="font-medium text-[var(--text-primary)]">{m.name}</p>
                {m.target && <p className="text-xs text-[var(--text-muted)]">{m.target}</p>}
                <p className="text-[var(--text-secondary)] mt-0.5">{m.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">5.</span> Suggested improvements
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
            {suggestedImprovements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">6.</span> Risk factors & mitigation
          </h3>
          <ul className="space-y-3 text-sm">
            {riskFactors.map((r, i) => (
              <li key={i} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <Badge variant={r.level === "high" ? "danger" : r.level === "medium" ? "warning" : "muted"}>
                    {r.level === "high" ? "High" : r.level === "medium" ? "Medium" : "Low"}
                  </Badge>
                  <span className="text-[var(--text-secondary)]">{r.description}</span>
                </div>
                {r.mitigation && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 pl-0">
                    <span className="font-medium">Mitigation:</span> {r.mitigation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(featureDependencies?.length ?? 0) > 0 && (
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">7.</span> Feature dependencies
          </h3>
          <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
            {featureDependencies!.map((d, i) => (
              <li key={i}>
                <span className="text-[var(--text-primary)] font-medium">{d.feature}</span>
                {" depends on "}
                <span className="text-[var(--text-primary)]">{d.dependsOn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(integrations?.length ?? 0) > 0 && (
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            <span className="text-[var(--accent)]">8.</span> Suggested integrations
          </h3>
          <ul className="space-y-2 text-sm">
            {integrations!.map((int, i) => (
              <li key={i}>
                <span className="font-medium text-[var(--text-primary)]">{int.name}</span>
                {int.purpose && <span className="text-[var(--text-secondary)]"> — {int.purpose}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
