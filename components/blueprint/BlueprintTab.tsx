import type { Blueprint as BlueprintType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const cardClass =
  "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5";

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

  const { technicalRequirements, feasibility, coreFeatures, suggestedImprovements, riskFactors, scores, overallScore, summary } = blueprint;

  return (
    <div className="space-y-6">
      <div className={`${cardClass} text-center`}>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Overall score</p>
        <p className="text-4xl font-bold text-[var(--accent-green)]">{overallScore.toFixed(1)} / 10</p>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">{summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span className="text-[var(--accent-green)]">[01]</span> Technical requirements
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--text-secondary)]">
            {technicalRequirements.map((r, i) => (
              <li key={i}>{r.text}</li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span className="text-[var(--accent-green)]">[02]</span> Feasibility
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <p className="text-[var(--text-muted)] text-xs">Complexity</p>
              <p>{feasibility.technicalComplexity ?? 0}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Resources</p>
              <p>{feasibility.resourceRequirements ?? 0}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Time to market</p>
              <p>{feasibility.timeToMarket ?? 0}/10</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Scalability</p>
              <p>{feasibility.scalabilityPotential ?? 0}/10</p>
            </div>
          </div>
          <Badge variant="success">[{feasibility.overallVerdict?.toUpperCase() ?? "MEDIUM"} FEASIBILITY]</Badge>
          <p className="text-sm text-[var(--text-secondary)] mt-3">{feasibility.summary}</p>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <span className="text-[var(--accent-green)]">[03]</span> Core features
        </h3>
        <ul className="space-y-4 text-sm">
          {coreFeatures.map((f, i) => (
            <li key={i} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="default">[{f.type.toUpperCase().replace("-", " ")}]</Badge>
                <span className="text-[var(--text-muted)]">{f.effort}</span>
                <span className="text-[var(--text-primary)] font-medium">{f.name}</span>
              </div>
              {f.description && (
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed mt-1 pl-0">
                  {f.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span className="text-[var(--accent-green)]">[04]</span> Suggested improvements
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
            {suggestedImprovements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span className="text-[var(--accent-green)]">[05]</span> Risk factors
          </h3>
          <ul className="space-y-2 text-sm">
            {riskFactors.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge variant={r.level === "high" ? "danger" : r.level === "medium" ? "warning" : "muted"}>
                  {r.level.toUpperCase()}
                </Badge>
                <span className="text-[var(--text-secondary)]">{r.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Score breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--text-muted)] text-xs">Clarity of scope</p>
            <p className="font-medium text-[var(--accent-green)]">{scores.clarityOfScope}/10</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">Technical feasibility</p>
            <p className="font-medium text-[var(--accent-green)]">{scores.technicalFeasibility}/10</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">Feature completeness</p>
            <p className="font-medium text-[var(--accent-green)]">{scores.featureCompleteness}/10</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">Risk profile</p>
            <p className="font-medium text-[var(--accent-green)]">{scores.riskProfile}/10</p>
          </div>
        </div>
      </div>
    </div>
  );
}
