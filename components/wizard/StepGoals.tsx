"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface StepGoalsProps {
  targetAudience: string;
  goals: string[];
  constraints: string;
  isClientProject: boolean;
  hourlyRateOverride: string;
  onTargetAudienceChange: (v: string) => void;
  onGoalsChange: (v: string[]) => void;
  onConstraintsChange: (v: string) => void;
  onIsClientProjectChange: (v: boolean) => void;
  onHourlyRateOverrideChange: (v: string) => void;
}

export function StepGoals({
  targetAudience,
  goals,
  constraints,
  isClientProject,
  hourlyRateOverride,
  onTargetAudienceChange,
  onGoalsChange,
  onConstraintsChange,
  onIsClientProjectChange,
  onHourlyRateOverrideChange,
}: StepGoalsProps) {
  const [goalInput, setGoalInput] = useState("");

  function addGoal() {
    const t = goalInput.trim();
    if (t && !goals.includes(t)) {
      onGoalsChange([...goals, t]);
      setGoalInput("");
    }
  }

  function removeGoal(g: string) {
    onGoalsChange(goals.filter((x) => x !== g));
  }

  return (
    <div className="space-y-4">
      <Input
        label="Target Audience"
        value={targetAudience}
        onChange={(e) => onTargetAudienceChange(e.target.value)}
        placeholder="e.g. Small business owners"
      />
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Key Goals (add as chips)
        </label>
        <div className="flex gap-2">
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
            placeholder="Add goal..."
            className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none"
          />
          <Button type="button" variant="secondary" onClick={addGoal}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {goals.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] text-sm"
            >
              {g}
              <button
                type="button"
                onClick={() => removeGoal(g)}
                className="text-[var(--text-muted)] hover:text-[var(--accent-red)]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Known Constraints (budget, timeline, team)
        </label>
        <textarea
          value={constraints}
          onChange={(e) => onConstraintsChange(e.target.value)}
          placeholder="e.g. 3-month timeline, solo developer"
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isClientProject}
          onChange={(e) => onIsClientProjectChange(e.target.checked)}
          className="rounded border-[var(--border)]"
        />
        <span className="text-sm">Client project?</span>
      </label>
      <Input
        label="Hourly rate override (optional)"
        type="number"
        value={hourlyRateOverride}
        onChange={(e) => onHourlyRateOverrideChange(e.target.value)}
        placeholder="Leave blank to use client default"
      />
    </div>
  );
}
