import type { ProjectType } from "./types";

export interface StackGroup {
  label: string;
  options: { value: string; label: string; recommended?: boolean; upcoming?: boolean }[];
}

export const WEBSITE_STACK: StackGroup[] = [
  {
    label: "WordPress",
    options: [
      { value: "Bricks Builder", label: "Bricks Builder", recommended: true },
      { value: "Mosaic Builder", label: "Mosaic Builder", upcoming: true },
      { value: "Elementor", label: "Elementor" },
      { value: "Divi", label: "Divi" },
      { value: "Gutenberg (Block Editor)", label: "Gutenberg (Block Editor)" },
      { value: "Oxygen Builder", label: "Oxygen Builder" },
      { value: "Beaver Builder", label: "Beaver Builder" },
      { value: "Breakdance", label: "Breakdance" },
    ],
  },
  {
    label: "No-Code / Low-Code",
    options: [
      { value: "Webflow", label: "Webflow" },
      { value: "Framer", label: "Framer" },
      { value: "Squarespace", label: "Squarespace" },
      { value: "Wix", label: "Wix" },
    ],
  },
  {
    label: "Static / JAMstack",
    options: [
      { value: "Next.js (Custom)", label: "Next.js (Custom)" },
      { value: "Astro", label: "Astro" },
      { value: "Nuxt.js", label: "Nuxt.js" },
      { value: "SvelteKit", label: "SvelteKit" },
      { value: "Remix", label: "Remix" },
      { value: "Gatsby", label: "Gatsby" },
    ],
  },
  {
    label: "E-Commerce",
    options: [
      { value: "Shopify", label: "Shopify" },
      { value: "WooCommerce (WordPress)", label: "WooCommerce (WordPress)" },
    ],
  },
];

export const WEB_APP_STACK: StackGroup[] = [
  {
    label: "Frameworks",
    options: [
      { value: "Next.js", label: "Next.js" },
      { value: "Remix", label: "Remix" },
      { value: "Nuxt.js", label: "Nuxt.js" },
      { value: "SvelteKit", label: "SvelteKit" },
      { value: "Laravel", label: "Laravel" },
      { value: "Django", label: "Django" },
      { value: "T3 Stack", label: "T3 Stack" },
      { value: "Phoenix (Elixir)", label: "Phoenix (Elixir)" },
    ],
  },
];

export const MOBILE_APP_STACK: StackGroup[] = [
  {
    label: "Frameworks",
    options: [
      { value: "React Native", label: "React Native" },
      { value: "Flutter", label: "Flutter" },
      { value: "Expo", label: "Expo" },
      { value: "Swift (iOS)", label: "Swift (iOS)" },
      { value: "Kotlin (Android)", label: "Kotlin (Android)" },
      { value: "Ionic", label: "Ionic" },
      { value: "Capacitor", label: "Capacitor" },
    ],
  },
];

export const API_STACK: StackGroup[] = [
  {
    label: "Backend",
    options: [
      { value: "Node.js + Express", label: "Node.js + Express" },
      { value: "Fastify", label: "Fastify" },
      { value: "NestJS", label: "NestJS" },
      { value: "Django REST", label: "Django REST" },
      { value: "FastAPI", label: "FastAPI" },
      { value: "Laravel", label: "Laravel" },
      { value: "Go + Chi", label: "Go + Chi" },
      { value: "Rust + Axum", label: "Rust + Axum" },
      { value: "GraphQL (Apollo)", label: "GraphQL (Apollo)" },
      { value: "tRPC", label: "tRPC" },
    ],
  },
];

export function getStackGroups(type: ProjectType): StackGroup[] {
  switch (type) {
    case "website":
      return WEBSITE_STACK;
    case "web_application":
      return WEB_APP_STACK;
    case "mobile_app":
      return MOBILE_APP_STACK;
    case "api":
      return API_STACK;
    default:
      return WEB_APP_STACK;
  }
}
