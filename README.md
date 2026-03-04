# DevBlueprint

**Developer productivity and client management** — plan projects, track time, manage clients, and generate proposals from a single app.

DevBlueprint is a full-stack SaaS for freelancers and small dev teams: create projects with AI-generated blueprints and task lists, log time, link work to clients, and turn proposals into invoices.

---

## Features

| Area | Description |
|------|-------------|
| **Dashboard** | Overview of active projects, clients, time this month, unbilled amount, and upcoming tasks. |
| **Projects** | Create and edit projects (website, web app, mobile app, API, CLI, other). Optional **AI-generated blueprint** (core features, milestones, risks, technical requirements) and **Kanban task board** with drag-and-drop. |
| **Clients** | Client directory with company, contact details, hourly rate, currency, and status (active/inactive/archived). |
| **Proposals** | Pre-project proposals linked to clients; optional **AI-generated content** and estimated pricing. Convert agreed proposals into projects. |
| **Time Logs** | Log hours per client/project, mark billable, attach to invoices. |
| **Invoices** | Create invoices from time logs; track status (draft, sent, paid, overdue, cancelled). |
| **Reports** | Reporting views for time and billing. |
| **Auth** | Email/password sign up, login, forgot password, reset password. |
| **Settings** | App settings and preferences. |
| **Theme** | Light/dark mode with system preference support. |
| **Search** | Command palette (⌘K) for quick navigation. |

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend / DB:** [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security)
- **AI (optional):** [Google Gemini](https://ai.google.dev/) for project blueprints, task generation, and proposal content
- **Other:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Kanban), [@xyflow/react](https://xyflow.dev/) (flow diagrams), [Lucide](https://lucide.dev/) icons, [Sonner](https://sonner.emilkowal.ski/) toasts

---

## Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or yarn/pnpm)
- **Supabase** account ([supabase.com](https://supabase.com))

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/devblueprint.git
cd devblueprint
npm install
```

### 2. Supabase project

1. Create a project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. In **SQL Editor**, run the migrations in `supabase/migrations/` in order (`001_initial_schema.sql` through the latest).
3. Copy **Project URL** and **anon (public) key** from **Settings → API**.

### 3. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Only if you need server-side admin (e.g. account deletion) |
| `GEMINI_API_KEY` | No | [Google AI Studio](https://aistudio.google.com/apikey) key for AI blueprints/tasks/proposals (app works without it) |
| `GEMINI_MODEL` | No | Override model (e.g. `gemini-1.5-flash`) if needed |
| `SUPABASE_PROJECT_ID` | No | For `npm run db:types` (TypeScript types from DB) |

Never commit `.env`; it is listed in `.gitignore`.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or log in and start using the app.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run db:types` | Generate TypeScript types from Supabase (requires `SUPABASE_PROJECT_ID`) |

---

## Project structure

```
devblueprint/
├── app/
│   ├── (app)/          # Main app routes (dashboard, projects, clients, etc.)
│   ├── (auth)/         # Login, register, forgot/reset password
│   ├── api/            # API routes (e.g. projects/generate, proposals/generate)
│   └── layout.tsx      # Root layout, fonts, theme
├── components/         # React components (UI, layout, dashboard, etc.)
├── lib/                # Supabase client, queries, types, utils, blueprint engine
├── public/             # Static assets
└── supabase/
    └── migrations/     # SQL migrations (run in order in Supabase SQL Editor)
```

---

## Database

Schema is managed via **Supabase migrations** in `supabase/migrations/`. Main entities:

- **clients** — Contact and billing info, hourly rate, currency
- **projects** — Title, type, status, optional `blueprint` (JSON), linked to client
- **tasks** — Kanban tasks per project (status, priority, category, effort)
- **proposals** — Pre-project proposals, optional generated content and estimated price
- **time_logs** — Hours per client/project, billable, optional link to invoice
- **invoices** — Invoice header and totals, link to client and time logs

Row Level Security (RLS) ensures users only see and edit their own data. Run migrations in numerical order after creating your Supabase project.

---

## AI features (optional)

With `GEMINI_API_KEY` set:

- **Project blueprint & tasks** — From project title, description, type, and stack, the app can generate a blueprint (features, milestones, risks, technical requirements) and a list of Kanban tasks.
- **Proposal content** — Generate proposal text and estimated pricing from proposal details.

Without the key, the app still works; blueprint/proposal generation is disabled or falls back to rule-based behaviour where implemented.

---

## Contributing

1. Fork the repo.
2. Create a branch from `main` for your change.
3. Make your edits and run `npm run lint` (and tests if added).
4. Open a pull request with a short description of the change.

---

## License

MIT (or your chosen license — update this section as needed.)
