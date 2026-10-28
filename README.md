# AquaVeris ActionIQ

**AI-Powered Water Quality Intelligence and Treatment Guidance**

AquaVeris ActionIQ transforms complex water-quality test results into understandable risk assessments and personalised action plans. It evaluates measurements against authoritative reference standards, checks whether your current treatment method addresses detected contaminants, and uses AI to generate plain-language guidance on what to do next.

> **Educational tool only.** AquaVeris ActionIQ does not replace certified laboratory testing, official drinking-water advisories, or professional medical advice.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | Google Gemini API |
| Validation | Zod + React Hook Form |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone and install

```bash
git clone https://github.com/your-username/aquaveris-actioniq.git
cd aquaveris-actioniq
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase URL, anon key, service role key, and Gemini API key.

### 3. Set up the database

Run the SQL migration files in `supabase/migrations/` against your Supabase project, either via the Supabase SQL Editor or with the Supabase CLI:

```bash
pnpm supabase db push
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login & signup (unauthenticated)
│   ├── (dashboard)/        # Protected dashboard routes
│   └── api/                # Route handlers (auth callbacks, AI endpoints)
├── components/
│   ├── ui/                 # shadcn/ui primitive components
│   └── shared/             # Shared layout components
├── features/               # Feature-first modules (auth, sources, tests, reports)
├── lib/
│   ├── supabase/           # Browser, server, and middleware Supabase clients
│   └── engine/             # Water quality rule engine (deterministic)
└── types/                  # TypeScript types (including database schema)
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (bypasses RLS) |
| `AI_API_KEY` | Server only | Google Gemini API key |
| `AI_MODEL_NAME` | Server only | Gemini model (e.g. `gemini-1.5-pro`) |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | Full URL of the deployed app |

---

## Build Phases

This project is built incrementally, one component at a time:

1. ✅ **Phase 1** — Project scaffold, Supabase clients, middleware, auth pages, landing page
2. 🔜 **Phase 2** — Database schema, RLS policies, seed data
3. 🔜 **Phase 3** — Authentication flow (email confirmation, profile)
4. 🔜 **Phase 4** — Dashboard & water source management
5. 🔜 **Phase 5** — Water test input form
6. 🔜 **Phase 6** — Water quality rule engine
7. 🔜 **Phase 7** — Smart Treatment Reality Check
8. 🔜 **Phase 8** — AI explanation engine (Gemini)
9. 🔜 **Phase 9** — Report page & display
10. 🔜 **Phase 10** — Historical monitoring & charts
11. 🔜 **Phase 11** — AI test-selection assistant

---

## Deployment

### Vercel

1. Import this repository into [Vercel](https://vercel.com)
2. Add all environment variables from `.env.example` in the Vercel project settings
3. Deploy from the `main` branch

### Supabase

Configure the Auth callback URL in your Supabase project:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/api/auth/callback`
