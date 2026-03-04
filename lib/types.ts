export type ProjectType =
  | "website"
  | "web_application"
  | "mobile_app"
  | "api"
  | "cli"
  | "other";

export type ProjectStatus = "active" | "archived" | "completed" | "on_hold";
export type ClientStatus = "active" | "inactive" | "archived";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
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
}

export interface Risk {
  level: "low" | "medium" | "high";
  description: string;
}

export interface ScoreBreakdown {
  clarityOfScope: number;
  technicalFeasibility: number;
  featureCompleteness: number;
  riskProfile: number;
}

export interface Blueprint {
  technicalRequirements: Requirement[];
  feasibility: FeasibilityAnalysis;
  coreFeatures: Feature[];
  suggestedImprovements: string[];
  riskFactors: Risk[];
  scores: ScoreBreakdown;
  overallScore: number;
  summary: string;
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
