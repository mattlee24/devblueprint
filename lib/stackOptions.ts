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
      { value: "GeneratePress", label: "GeneratePress" },
      { value: "Kadence", label: "Kadence" },
    ],
  },
  {
    label: "No-Code / Low-Code",
    options: [
      { value: "Webflow", label: "Webflow" },
      { value: "Framer", label: "Framer" },
      { value: "Squarespace", label: "Squarespace" },
      { value: "Wix", label: "Wix" },
      { value: "Carrd", label: "Carrd" },
      { value: "Notion (public site)", label: "Notion (public site)" },
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
      { value: "11ty", label: "11ty" },
      { value: "Hugo", label: "Hugo" },
      { value: "Jekyll", label: "Jekyll" },
    ],
  },
  {
    label: "E-Commerce & CMS",
    options: [
      { value: "Shopify", label: "Shopify" },
      { value: "WooCommerce (WordPress)", label: "WooCommerce (WordPress)" },
      { value: "Sanity", label: "Sanity" },
      { value: "Contentful", label: "Contentful" },
      { value: "Strapi", label: "Strapi" },
      { value: "Payload CMS", label: "Payload CMS" },
      { value: "Prismic", label: "Prismic" },
    ],
  },
  {
    label: "Hosting & infra",
    options: [
      { value: "Vercel", label: "Vercel" },
      { value: "Netlify", label: "Netlify" },
      { value: "Cloudflare Pages", label: "Cloudflare Pages" },
      { value: "AWS (Amplify / S3)", label: "AWS (Amplify / S3)" },
      { value: "Kinsta", label: "Kinsta" },
      { value: "WP Engine", label: "WP Engine" },
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
      { value: "Rails", label: "Rails" },
      { value: "Fastify (Node)", label: "Fastify (Node)" },
      { value: "Solid.js", label: "Solid.js" },
      { value: "Qwik", label: "Qwik" },
      { value: "Angular", label: "Angular" },
      { value: "Vue.js", label: "Vue.js" },
      { value: "React (Vite)", label: "React (Vite)" },
    ],
  },
  {
    label: "State & data",
    options: [
      { value: "TanStack Query", label: "TanStack Query" },
      { value: "Zustand", label: "Zustand" },
      { value: "Redux", label: "Redux" },
      { value: "Jotai", label: "Jotai" },
      { value: "SWR", label: "SWR" },
      { value: "Prisma", label: "Prisma" },
      { value: "Drizzle", label: "Drizzle" },
    ],
  },
  {
    label: "Databases",
    options: [
      { value: "PostgreSQL", label: "PostgreSQL" },
      { value: "MySQL", label: "MySQL" },
      { value: "Supabase", label: "Supabase" },
      { value: "MongoDB", label: "MongoDB" },
      { value: "Redis", label: "Redis" },
      { value: "PlanetScale", label: "PlanetScale" },
    ],
  },
  {
    label: "Testing & tooling",
    options: [
      { value: "Vitest", label: "Vitest" },
      { value: "Jest", label: "Jest" },
      { value: "Playwright", label: "Playwright" },
      { value: "Cypress", label: "Cypress" },
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
      { value: "Tamagui", label: "Tamagui" },
      { value: "NativeWind", label: "NativeWind" },
    ],
  },
  {
    label: "Backend & services",
    options: [
      { value: "Firebase", label: "Firebase" },
      { value: "Supabase", label: "Supabase" },
      { value: "AWS Amplify", label: "AWS Amplify" },
    ],
  },
];

export const API_STACK: StackGroup[] = [
  {
    label: "Runtimes & frameworks",
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
      { value: "Hono", label: "Hono" },
      { value: "Bun", label: "Bun" },
      { value: "Ruby on Rails API", label: "Ruby on Rails API" },
    ],
  },
  {
    label: "Databases & queues",
    options: [
      { value: "PostgreSQL", label: "PostgreSQL" },
      { value: "Redis", label: "Redis" },
      { value: "MongoDB", label: "MongoDB" },
      { value: "RabbitMQ", label: "RabbitMQ" },
      { value: "Bull / BullMQ", label: "Bull / BullMQ" },
    ],
  },
  {
    label: "Cloud & auth",
    options: [
      { value: "AWS (Lambda / API Gateway)", label: "AWS (Lambda / API Gateway)" },
      { value: "Vercel Edge", label: "Vercel Edge" },
      { value: "Supabase Auth", label: "Supabase Auth" },
      { value: "Clerk", label: "Clerk" },
      { value: "Auth0", label: "Auth0" },
    ],
  },
];

export const CLI_OTHER_STACK: StackGroup[] = [
  {
    label: "Languages & runtimes",
    options: [
      { value: "Node.js", label: "Node.js" },
      { value: "Python", label: "Python" },
      { value: "Go", label: "Go" },
      { value: "Rust", label: "Rust" },
      { value: "Bun", label: "Bun" },
    ],
  },
  {
    label: "Tools",
    options: [
      { value: "Commander.js", label: "Commander.js" },
      { value: "Ink (React CLI)", label: "Ink (React CLI)" },
      { value: "Oclif", label: "Oclif" },
      { value: "Click (Python)", label: "Click (Python)" },
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
    case "cli":
    case "other":
      return CLI_OTHER_STACK;
    default:
      return [...WEB_APP_STACK, ...CLI_OTHER_STACK];
  }
}
