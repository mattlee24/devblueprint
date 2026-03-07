export type ProjectType =
  | "website"
  | "web_application"
  | "mobile_app"
  | "api"
  | "cli"
  | "other";

export type ProjectStatus = "active" | "archived" | "completed" | "on_hold";
export type ClientStatus = "active" | "inactive" | "archived";
/** Task status is the board column id (string). Use board config columnOrder/columnLabels for options. */
export type TaskStatus = string;
export type TaskPriority = "p1" | "p2" | "p3";
export type TaskCategory =
  | "dev"
  | "design"
  | "content"
  | "seo"
  | "devops"
  | "testing"
  | "other";
export type TaskEffort = "low" | "medium" | "high";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface ProjectInput {
  title: string;
  description: string;
  type: ProjectType;
  stack: string[];
  goals?: string[];
  constraints?: string;
  targetAudience?: string;
}

export interface Requirement {
  text: string;
}

export interface FeasibilityAnalysis {
  technicalComplexity: number;
  resourceRequirements: number;
  timeToMarket: number;
  scalabilityPotential: number;
  overallVerdict: "low" | "medium" | "high";
  summary: string;
}

export interface Feature {
  name: string;
  type: "core" | "nice-to-have" | "advanced";
  effort: string;
  /** Optional detailed description (what it is, why it matters, how it fits the project). */
  description?: string;
  /** User stories or use cases for this feature. */
  userStories?: string[];
}

export interface Risk {
  level: "low" | "medium" | "high";
  description: string;
  /** Mitigation strategy for this risk. */
  mitigation?: string;
}

export interface Milestone {
  name: string;
  description: string;
  target?: string;
}

export interface FeatureDependency {
  feature: string;
  dependsOn: string;
}

export interface SuggestedIntegration {
  name: string;
  purpose: string;
}

export interface Blueprint {
  technicalRequirements: Requirement[];
  /** @deprecated Not displayed; kept for backward compatibility. */
  feasibility?: FeasibilityAnalysis;
  coreFeatures: Feature[];
  suggestedImprovements: string[];
  riskFactors: Risk[];
  /** Suggested project phases or milestones. */
  milestones?: Milestone[];
  /** Dependencies between features (e.g. "Auth" depends on "User model"). */
  featureDependencies?: FeatureDependency[];
  /** Suggested third-party tools or integrations. */
  integrations?: SuggestedIntegration[];
  /** @deprecated Not displayed; kept for backward compatibility. */
  scores?: ScoreBreakdown;
  /** @deprecated Not displayed; kept for backward compatibility. */
  overallScore?: number;
  summary: string;
}

export interface ScoreBreakdown {
  clarityOfScope: number;
  technicalFeasibility: number;
  featureCompleteness: number;
  riskProfile: number;
}


export interface TaskTemplate {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  effort: TaskEffort;
  position: number;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}
