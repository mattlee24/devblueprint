import type { Blueprint, Feature } from "@/lib/types";

/**
 * Parse effort string (e.g. "~3d", "3 days", "~1 week") to number of days.
 * Returns null if unparseable.
 */
export function parseEffortDays(effort: string): number | null {
  const s = effort.trim().toLowerCase();
  const dMatch = s.match(/^~?(\d+)\s*d(ays?)?$/);
  if (dMatch) return Math.max(0, parseInt(dMatch[1], 10));
  const weekMatch = s.match(/^~?(\d+)\s*w(eek(s?))?$/);
  if (weekMatch) return Math.max(0, parseInt(weekMatch[1], 10)) * 7;
  const dayWordMatch = s.match(/^(\d+)\s+days?$/);
  if (dayWordMatch) return Math.max(0, parseInt(dayWordMatch[1], 10));
  const weekWordMatch = s.match(/^(\d+)\s+weeks?$/);
  if (weekWordMatch) return Math.max(0, parseInt(weekWordMatch[1], 10)) * 7;
  return null;
}

/**
 * Sum estimated days from core features' effort strings.
 */
export function totalEstimatedDays(features: Feature[]): number | null {
  let total = 0;
  let anyParsed = false;
  for (const f of features) {
    const d = parseEffortDays(f.effort ?? "");
    if (d != null) {
      total += d;
      anyParsed = true;
    }
  }
  return anyParsed ? total : null;
}

/**
 * Count non-empty sections in a blueprint (1-7).
 */
export function countBlueprintSections(b: Blueprint): number {
  let n = 0;
  if (b.technicalRequirements?.length) n++;
  if (b.coreFeatures?.length) n++;
  if (b.milestones?.length) n++;
  if (b.suggestedImprovements?.length) n++;
  if (b.riskFactors?.length) n++;
  if ((b.featureDependencies?.length ?? 0) > 0) n++;
  if ((b.integrations?.length ?? 0) > 0) n++;
  return n;
}

export const BLUEPRINT_SECTION_IDS = [
  "section-1",
  "section-2",
  "section-3",
  "section-4",
  "section-5",
  "section-6",
  "section-7",
] as const;

export const BLUEPRINT_SECTION_LABELS = [
  "Technical requirements",
  "Core features",
  "Milestones & phases",
  "Suggested improvements",
  "Risk factors & mitigation",
  "Feature dependencies",
  "Suggested integrations",
] as const;
