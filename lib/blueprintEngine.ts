import type {
  ProjectInput,
  Blueprint,
  Requirement,
  FeasibilityAnalysis,
  Feature,
  Risk,
  ScoreBreakdown,
  TaskTemplate,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskEffort,
  FlowNode,
  FlowEdge,
  ProjectType,
} from "./types";

// ─── Stack → Technical requirements lookup ───────────────────────────────
const STACK_REQUIREMENTS: Record<string, Requirement[]> = {
  "Bricks Builder": [
    { text: "WordPress hosting (PHP 8.2+, MySQL 8.0+, min 2GB RAM)" },
    { text: "Bricks Builder Pro licence required" },
    { text: "SSL certificate (Let's Encrypt or paid)" },
    { text: "CDN (Cloudflare recommended)" },
    { text: "Caching: WP Rocket or Perfmatters" },
    { text: "Image optimisation: ShortPixel or Imagify" },
    { text: "Security: Wordfence or Solid Security" },
    { text: "Recommended: Git-based version control with WP Pusher or similar" },
    { text: "Staging environment (e.g. WP Stagecoach, Kinsta staging)" },
  ],
  "Mosaic Builder": [
    { text: "WordPress hosting (PHP 8.2+, MySQL 8.0+, min 2GB RAM)" },
    { text: "Mosaic Builder licence (growing ecosystem, check current pricing)" },
    { text: "SSL certificate (Let's Encrypt or paid)" },
    { text: "CDN (Cloudflare recommended)" },
    { text: "Caching plugin (WP Rocket or equivalent)" },
    { text: "Image optimisation: ShortPixel or Imagify" },
    { text: "Security: Wordfence or Solid Security" },
    { text: "Staging environment for safe updates" },
    { text: "Note: Mosaic is newer; ensure theme/plugin compatibility" },
  ],
  "Elementor": [
    { text: "WordPress hosting (PHP 8.0+, MySQL 5.7+)" },
    { text: "Elementor Pro licence for full features" },
    { text: "SSL, CDN, caching (WP Rocket, etc.)" },
    { text: "Staging for design iterations" },
  ],
  "Next.js (Custom)": [
    { text: "Node.js 18+ runtime" },
    { text: "Vercel, Netlify, or Node hosting" },
    { text: "Environment variables for API keys" },
    { text: "CI/CD for builds and deploys" },
  ],
  "Next.js": [
    { text: "Node.js 18+ runtime" },
    { text: "Vercel, Netlify, or Node hosting" },
    { text: "Environment variables for API keys" },
    { text: "CI/CD for builds and deploys" },
  ],
  "React Native": [
    { text: "Node.js, Xcode (iOS), Android Studio" },
    { text: "Expo or bare workflow" },
    { text: "App store developer accounts" },
  ],
  "Flutter": [
    { text: "Flutter SDK, Dart" },
    { text: "Android Studio / Xcode for builds" },
    { text: "App store developer accounts" },
  ],
  "Laravel": [
    { text: "PHP 8.2+, Composer" },
    { text: "MySQL/PostgreSQL" },
    { text: "Queue driver (Redis recommended for production)" },
  ],
  "Django": [
    { text: "Python 3.10+, pip/venv" },
    { text: "PostgreSQL or MySQL" },
    { text: "Gunicorn/uWSGI + Nginx for production" },
  ],
  "Shopify": [
    { text: "Shopify store subscription" },
    { text: "Theme or custom storefront (Hydrogen optional)" },
    { text: "Payment and shipping configuration" },
  ],
  "Webflow": [
    { text: "Webflow account and plan" },
    { text: "Custom code allowed on higher plans" },
    { text: "Export or host on Webflow" },
  ],
};

function getRequirementsForStack(stack: string[]): Requirement[] {
  const out: Requirement[] = [];
  const seen = new Set<string>();
  for (const s of stack) {
    const reqs = STACK_REQUIREMENTS[s] ?? [];
    for (const r of reqs) {
      if (!seen.has(r.text)) {
        seen.add(r.text);
        out.push(r);
      }
    }
  }
  if (out.length === 0) {
    out.push({ text: "Define hosting and runtime per chosen stack" });
    out.push({ text: "SSL/TLS and security best practices" });
  }
  return out;
}

// ─── Keyword scanning for features and complexity ──────────────────────────
const FEATURE_KEYWORDS: Array<{ keywords: RegExp[]; name: string; type: Feature["type"]; effort: string; description?: string }> = [
  { keywords: [/login|auth|sign\s*in|register|user\s*account/i], name: "Authentication & user management", type: "core", effort: "~1d", description: "Secure sign-in, registration, and user accounts so visitors can access personalised content or protected areas." },
  { keywords: [/dashboard|analytics|admin\s*panel/i], name: "Dashboard and analytics UI", type: "core", effort: "~3d", description: "Central view for key metrics and controls; supports decision-making and day-to-day management." },
  { keywords: [/responsive|mobile|breakpoint/i], name: "Responsive layout system", type: "core", effort: "~2h", description: "Layout and components adapt to screen size so the site works well on mobile, tablet, and desktop." },
  { keywords: [/dark\s*mode|theme/i], name: "Dark mode toggle", type: "nice-to-have", effort: "~1d", description: "Optional dark theme to reduce eye strain and match user preference where supported." },
  { keywords: [/real[- ]?time|live|websocket|realtime/i], name: "Real-time notifications", type: "advanced", effort: "~3d", description: "Live updates (e.g. WebSockets) so users see changes without refreshing the page." },
  { keywords: [/api|integration|third[- ]?party|stripe|payment/i], name: "Third-party API integrations", type: "advanced", effort: "~5d", description: "Connections to external services (payments, CRM, etc.) to extend functionality and automate workflows." },
  { keywords: [/shop|store|e[- ]?commerce|cart|checkout/i], name: "E-commerce / checkout", type: "core", effort: "~5d", description: "Product catalog, cart, and checkout flow to sell and fulfil orders online." },
  { keywords: [/blog|blog|news|cms|content\s*manage/i], name: "Blog / CMS", type: "core", effort: "~2d", description: "Content management and publishing for articles, news, or updates with a clear structure and workflow." },
  { keywords: [/contact|form|newsletter/i], name: "Contact forms / lead capture", type: "core", effort: "~2h", description: "Forms for enquiries, feedback, or newsletter sign-up to capture and qualify leads." },
];

function extractFeatures(description: string): Feature[] {
  const features: Feature[] = [];
  const seen = new Set<string>();
  for (const { keywords, name, type, effort, description: desc } of FEATURE_KEYWORDS) {
    if (keywords.some((k) => k.test(description)) && !seen.has(name)) {
      seen.add(name);
      features.push({ name, type, effort, ...(desc ? { description: desc } : {}) });
    }
  }
  if (features.length === 0) {
    features.push({ name: "Core layout and pages", type: "core", effort: "~1d", description: "Main pages and navigation structure that define the site’s layout and entry points." });
  }
  return features;
}

function complexityScore(description: string): number {
  let score = 5;
  if (/real[- ]?time|websocket|live\s*data/i.test(description)) score += 1.5;
  if (/multi[- ]?user|collaboration|team/i.test(description)) score += 1;
  if (/payment|stripe|checkout|e[- ]?commerce/i.test(description)) score += 1.5;
  if (/auth|login|register|user\s*account/i.test(description)) score += 0.5;
  if (description.length > 500) score += 0.5;
  if (description.length > 1000) score += 0.5;
  return Math.min(10, Math.max(1, score));
}

// ─── Feasibility and scores ────────────────────────────────────────────────
function computeFeasibility(input: ProjectInput, complexity: number): FeasibilityAnalysis {
  const technicalComplexity = Math.min(10, complexity + 1);
  const resourceRequirements = Math.min(10, Math.max(3, 10 - input.stack.length));
  const timeToMarket = Math.max(4, 10 - technicalComplexity);
  const scalabilityPotential = 7;
  const avg = (technicalComplexity + resourceRequirements + timeToMarket + scalabilityPotential) / 4;
  let overallVerdict: FeasibilityAnalysis["overallVerdict"] = "medium";
  if (avg >= 7.5) overallVerdict = "high";
  else if (avg < 5) overallVerdict = "low";
  const summary =
    overallVerdict === "high"
      ? "Project is well-scoped and technically feasible with the chosen stack."
      : overallVerdict === "low"
        ? "Consider simplifying scope or adding more technical clarity."
        : "Project is feasible with clear milestones and risk mitigation.";
  return {
    technicalComplexity,
    resourceRequirements,
    timeToMarket,
    scalabilityPotential,
    overallVerdict,
    summary,
  };
}

function computeScoreBreakdown(
  input: ProjectInput,
  feasibility: FeasibilityAnalysis,
  featureCount: number
): ScoreBreakdown {
  const clarityOfScope = Math.min(10, Math.max(4, Math.floor(input.description.length / 80) + 4));
  const technicalFeasibility = Math.round(
    (10 - feasibility.technicalComplexity + feasibility.timeToMarket) / 2
  );
  const featureCompleteness = Math.min(10, 5 + featureCount);
  const riskProfile = Math.max(3, 10 - (feasibility.technicalComplexity ?? 5));
  return {
    clarityOfScope: Math.min(10, clarityOfScope),
    technicalFeasibility: Math.min(10, technicalFeasibility),
    featureCompleteness: Math.min(10, featureCompleteness),
    riskProfile: Math.min(10, riskProfile),
  };
}

// ─── Suggested improvements (stack-aware) ─────────────────────────────────
function getSuggestedImprovements(input: ProjectInput): string[] {
  const list: string[] = [];
  const stackStr = input.stack.join(" ").toLowerCase();
  if (stackStr.includes("bricks")) {
    list.push("Consider using Bricks' Query Loop for dynamic post listings to avoid plugin overhead.");
    list.push("Implement Critical CSS extraction to improve LCP score.");
    list.push("Use Cloudflare's proxy for both CDN and DDoS protection.");
    list.push("Add an XML sitemap via Rank Math and submit to Google Search Console on launch.");
    list.push("Use Bricks dynamic data for reusable templates and easier content updates.");
    list.push("Plan a design system (colours, typography, spacing) before building pages.");
  }
  if (stackStr.includes("mosaic")) {
    list.push("Keep Mosaic and WordPress core updated; test on staging before production.");
    list.push("Use Cloudflare for CDN and security.");
    list.push("Add sitemap and SEO baseline (Rank Math or Yoast).");
    list.push("Document any custom patterns for future maintainability.");
  }
  if (stackStr.includes("wordpress") || stackStr.includes("elementor")) {
    list.push("Limit active plugins to reduce bloat and improve performance.");
    list.push("Plan caching and image optimisation from the start.");
    list.push("Define a backup and update strategy early.");
  }
  if (stackStr.includes("next")) {
    list.push("Use Next.js App Router for layouts and shared UI.");
    list.push("Consider edge runtime for low-latency responses where applicable.");
    list.push("Set up structured data and meta tags for SEO.");
  }
  if (input.type === "website") {
    list.push("Define clear page hierarchy and CTAs for conversion.");
    list.push("Include accessibility (keyboard nav, focus, contrast) from the start.");
  }
  if (input.type === "web_application") {
    list.push("Add error boundaries and graceful degradation for key flows.");
    list.push("Plan analytics and feature flags for post-launch iteration.");
  }
  if (list.length === 0) {
    list.push("Document technical decisions and deployment steps.");
    list.push("Set up error monitoring and basic analytics.");
  }
  list.push("Schedule a post-launch review to capture learnings.");
  return list;
}

// ─── Risk factors ─────────────────────────────────────────────────────────
function getRiskFactors(input: ProjectInput, feasibility: FeasibilityAnalysis): Risk[] {
  const risks: Risk[] = [];
  if (input.description.length > 400) {
    risks.push({ level: "medium", description: "Scope creep — description suggests a broad feature surface" });
  }
  if (input.stack.some((s) => /wordpress|elementor|bricks|mosaic/i.test(s))) {
    risks.push({
      level: "medium",
      description: "Reliance on third-party plugin ecosystem (WordPress)",
    });
  }
  if (feasibility.technicalComplexity >= 7) {
    risks.push({ level: "high", description: "Technical complexity may require phased delivery" });
  }
  risks.push({ level: "low", description: "Initial performance tuning required for page speed targets" });
  risks.push({ level: "low", description: "SEO setup complexity for multi-page architecture" });
  risks.push({ level: "low", description: "Browser and device fragmentation may require extra QA" });
  risks.push({ level: "low", description: "Content and copy delays can impact launch timeline" });
  if (input.stack.some((s) => /next|react/i.test(s))) {
    risks.push({ level: "low", description: "Dependency updates and breaking changes in the ecosystem" });
  }
  return risks;
}

// ─── Main blueprint generator ─────────────────────────────────────────────
export function generateBlueprint(input: ProjectInput): Blueprint {
  const technicalRequirements = getRequirementsForStack(input.stack);
  const coreFeatures = extractFeatures(input.description);
  const complexity = complexityScore(input.description);
  const feasibility = computeFeasibility(input, complexity);
  const suggestedImprovements = getSuggestedImprovements(input);
  const riskFactors = getRiskFactors(input, feasibility);
  const scores = computeScoreBreakdown(input, feasibility, coreFeatures.length);
  const overallScore = Math.round(
    (scores.clarityOfScope + scores.technicalFeasibility + scores.featureCompleteness + scores.riskProfile) * 2.5
  ) / 10;
  const summary =
    `Overall score ${overallScore.toFixed(1)}/10. ${feasibility.summary} ` +
    `Key features identified: ${coreFeatures.map((f) => f.name).join(", ") || "core layout"}.`;

  return {
    technicalRequirements,
    feasibility,
    coreFeatures,
    suggestedImprovements,
    riskFactors,
    scores,
    overallScore: Math.min(10, Math.max(0, overallScore)),
    summary,
  };
}

// ─── Task templates by project type and stack ─────────────────────────────
const WEBSITE_TASKS: Omit<TaskTemplate, "position">[] = [
  { title: "Provision hosting environment", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Configure staging environment", status: "todo", priority: "p2", category: "devops", effort: "low" },
  { title: "Set up CDN and SSL", status: "todo", priority: "p2", category: "devops", effort: "low" },
  { title: "Define global styles (fonts, colours, spacing)", status: "todo", priority: "p2", category: "design", effort: "medium" },
  { title: "Build header and footer templates", status: "todo", priority: "p2", category: "design", effort: "high" },
  { title: "Design and build homepage", status: "todo", priority: "p1", category: "design", effort: "high" },
  { title: "Design and build inner page template", status: "todo", priority: "p2", category: "design", effort: "high" },
  { title: "Create 404 and error page templates", status: "todo", priority: "p3", category: "design", effort: "low" },
  { title: "Install and configure SEO plugin", status: "todo", priority: "p2", category: "dev", effort: "low" },
  { title: "Install and configure caching", status: "todo", priority: "p2", category: "dev", effort: "low" },
  { title: "Set up contact form and validation", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Write and add page copy", status: "todo", priority: "p2", category: "content", effort: "high" },
  { title: "Content audit and structure", status: "todo", priority: "p2", category: "content", effort: "medium" },
  { title: "Source and optimise imagery", status: "todo", priority: "p2", category: "design", effort: "high" },
  { title: "Accessibility audit (WCAG)", status: "todo", priority: "p2", category: "testing", effort: "medium" },
  { title: "Cross-browser QA", status: "todo", priority: "p2", category: "testing", effort: "medium" },
  { title: "Mobile responsiveness pass", status: "todo", priority: "p2", category: "testing", effort: "low" },
  { title: "Page titles, meta descriptions, OG tags", status: "todo", priority: "p2", category: "seo", effort: "low" },
  { title: "Structured data (Schema.org)", status: "todo", priority: "p3", category: "seo", effort: "low" },
  { title: "Submit sitemap to Google Search Console", status: "todo", priority: "p3", category: "devops", effort: "low" },
  { title: "Page speed audit (Lighthouse)", status: "todo", priority: "p2", category: "testing", effort: "low" },
  { title: "Security hardening and headers", status: "todo", priority: "p2", category: "devops", effort: "low" },
  { title: "Backup and recovery procedure", status: "todo", priority: "p2", category: "devops", effort: "low" },
  { title: "Final pre-launch checklist", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Go live — DNS / remove maintenance mode", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Client handover and documentation", status: "todo", priority: "p2", category: "content", effort: "medium" },
];

const BRICKS_EXTRA: Omit<TaskTemplate, "position">[] = [
  { title: "Install and license Bricks Builder Pro", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Set up custom post types and ACF if needed", status: "todo", priority: "p2", category: "dev", effort: "medium" },
];

const WEB_APP_TASKS: Omit<TaskTemplate, "position">[] = [
  { title: "Set up repository and CI/CD", status: "todo", priority: "p1", category: "devops", effort: "medium" },
  { title: "Environment and config management", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Implement authentication", status: "todo", priority: "p1", category: "dev", effort: "high" },
  { title: "Role-based access and permissions", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Build onboarding flow", status: "todo", priority: "p2", category: "design", effort: "medium" },
  { title: "Build main dashboard", status: "todo", priority: "p1", category: "dev", effort: "high" },
  { title: "Data tables and filtering", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Implement core feature set", status: "todo", priority: "p1", category: "dev", effort: "high" },
  { title: "API integration and error handling", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Settings and profile pages", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Email and notifications", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Unit and integration tests", status: "todo", priority: "p2", category: "testing", effort: "high" },
  { title: "E2E tests for critical paths", status: "todo", priority: "p2", category: "testing", effort: "medium" },
  { title: "Testing and bug fixes", status: "todo", priority: "p2", category: "testing", effort: "high" },
  { title: "Performance and bundle optimisation", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Deploy to production", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Monitoring and logging", status: "todo", priority: "p2", category: "devops", effort: "low" },
];

const MOBILE_APP_TASKS: Omit<TaskTemplate, "position">[] = [
  { title: "Set up project and toolchain", status: "todo", priority: "p1", category: "devops", effort: "medium" },
  { title: "Implement auth and API integration", status: "todo", priority: "p1", category: "dev", effort: "high" },
  { title: "Offline support and sync", status: "todo", priority: "p2", category: "dev", effort: "high" },
  { title: "Build main screens", status: "todo", priority: "p1", category: "design", effort: "high" },
  { title: "Navigation and deep linking", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Push notifications", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Analytics and crash reporting", status: "todo", priority: "p2", category: "devops", effort: "low" },
  { title: "Testing on devices", status: "todo", priority: "p2", category: "testing", effort: "high" },
  { title: "Store listing assets and copy", status: "todo", priority: "p2", category: "content", effort: "medium" },
  { title: "Store submission prep", status: "todo", priority: "p2", category: "devops", effort: "medium" },
];

const API_TASKS: Omit<TaskTemplate, "position">[] = [
  { title: "Scaffold API and env config", status: "todo", priority: "p1", category: "devops", effort: "low" },
  { title: "Implement auth (e.g. JWT)", status: "todo", priority: "p1", category: "dev", effort: "medium" },
  { title: "Rate limiting and throttling", status: "todo", priority: "p2", category: "dev", effort: "low" },
  { title: "Core endpoints", status: "todo", priority: "p1", category: "dev", effort: "high" },
  { title: "Validation and error responses", status: "todo", priority: "p2", category: "dev", effort: "medium" },
  { title: "Database migrations and seeds", status: "todo", priority: "p2", category: "devops", effort: "medium" },
  { title: "Unit and integration tests", status: "todo", priority: "p2", category: "testing", effort: "high" },
  { title: "Documentation (OpenAPI/Swagger)", status: "todo", priority: "p2", category: "content", effort: "medium" },
  { title: "Deploy and monitor", status: "todo", priority: "p1", category: "devops", effort: "medium" },
];

function getBaseTasks(type: ProjectType): Omit<TaskTemplate, "position">[] {
  switch (type) {
    case "website":
      return WEBSITE_TASKS;
    case "web_application":
      return WEB_APP_TASKS;
    case "mobile_app":
      return MOBILE_APP_TASKS;
    case "api":
    case "cli":
      return API_TASKS;
    default:
      return [...WEB_APP_TASKS.slice(0, 8)];
  }
}

export function generateTasks(input: ProjectInput, blueprint: Blueprint): TaskTemplate[] {
  const base = getBaseTasks(input.type);
  const extra =
    input.stack.some((s) => /Bricks Builder/i.test(s)) ? BRICKS_EXTRA : [];
  const featureTasks: Omit<TaskTemplate, "position">[] = (blueprint.coreFeatures ?? []).slice(0, 12).map((f) => ({
    title: `Implement: ${f.name}`,
    description: f.description ?? undefined,
    status: "todo" as TaskStatus,
    priority: "p2" as TaskPriority,
    category: "dev" as TaskCategory,
    effort: "medium" as TaskEffort,
  }));
  const combined = [...base, ...extra, ...featureTasks];
  return combined.map((t, i) => ({
    ...t,
    position: i,
  }));
}

// ─── User flow nodes/edges for React Flow ─────────────────────────────────
function makeNode(
  id: string,
  label: string,
  type: string,
  x: number,
  y: number
): FlowNode {
  return { id, type, position: { x, y }, data: { label } };
}

function makeEdge(id: string, source: string, target: string): FlowEdge {
  return { id, source, target };
}

const WEBSITE_FLOW = (): { nodes: FlowNode[]; edges: FlowEdge[] } => {
  const nodes: FlowNode[] = [
    makeNode("start", "[START]", "start", 0, 0),
    makeNode("landing", "Landing", "page", 200, 0),
    makeNode("nav", "Nav Menu", "action", 400, 0),
    makeNode("page", "[PAGE]", "page", 600, 0),
    makeNode("cta", "CTA", "action", 800, 0),
    makeNode("contact", "Contact Form", "page", 1000, 0),
    makeNode("confirm", "Confirmation", "page", 1200, 0),
    makeNode("end", "[END]", "end", 1400, 0),
  ];
  const edges: FlowEdge[] = [
    makeEdge("e1", "start", "landing"),
    makeEdge("e2", "landing", "nav"),
    makeEdge("e3", "nav", "page"),
    makeEdge("e4", "page", "cta"),
    makeEdge("e5", "cta", "contact"),
    makeEdge("e6", "contact", "confirm"),
    makeEdge("e7", "confirm", "end"),
  ];
  return { nodes, edges };
};

const WEB_APP_FLOW = (): { nodes: FlowNode[]; edges: FlowEdge[] } => {
  const nodes: FlowNode[] = [
    makeNode("start", "[START]", "start", 0, 0),
    makeNode("landing", "Landing", "page", 150, 0),
    makeNode("auth", "Auth", "action", 350, 0),
    makeNode("onboard", "Onboarding", "page", 550, 0),
    makeNode("dashboard", "Dashboard", "page", 750, 0),
    makeNode("feature", "Feature", "page", 950, 0),
    makeNode("settings", "Settings", "page", 1150, 0),
    makeNode("logout", "Logout", "action", 1350, 0),
    makeNode("end", "[END]", "end", 1550, 0),
  ];
  const edges: FlowEdge[] = [
    makeEdge("e1", "start", "landing"),
    makeEdge("e2", "landing", "auth"),
    makeEdge("e3", "auth", "onboard"),
    makeEdge("e4", "onboard", "dashboard"),
    makeEdge("e5", "dashboard", "feature"),
    makeEdge("e6", "feature", "settings"),
    makeEdge("e7", "settings", "logout"),
    makeEdge("e8", "logout", "end"),
  ];
  return { nodes, edges };
};

export function generateUserFlowNodes(input: ProjectInput): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  if (input.type === "website") return WEBSITE_FLOW();
  if (input.type === "web_application") return WEB_APP_FLOW();
  return WEBSITE_FLOW();
}
