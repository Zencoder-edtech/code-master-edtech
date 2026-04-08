# 📚 CodeMaster EdTech — Project Guide

> **Read this first.** This file explains how every part of the project works, so you never feel lost in your own codebase.

---

## 🤔 What is a Monorepo?

A **monorepo** is one Git repository that holds **multiple projects** (apps + shared packages). Instead of having separate repos for frontend, backend, and shared code, everything lives together.

**Why?** Because shared code (like UI components, TypeScript configs, and database models) can be imported directly without publishing to npm.

```
code-master-edtech/          ← One repo
├── apps/web/                ← App 1: Next.js frontend
├── apps/docs/               ← App 2: Documentation (unused for now)
├── packages/ui/             ← Shared: React components
├── packages/infrastructure/ ← Shared: Database (Prisma + Supabase)
├── packages/typescript-config/ ← Shared: TypeScript rules
├── packages/eslint-config/  ← Shared: Linting rules
└── packages/tailwind-config/← Shared: CSS/Tailwind rules
```

---

## 🔧 Tools Used & Why

| Tool               | What it Does                             | Why We Use It                                                             |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| **pnpm**           | Package manager (like npm)               | Faster, saves disk space via hard links, built-in workspace support       |
| **Turborepo**      | Runs tasks across the monorepo           | Parallel builds, caching (only rebuilds what changed), task orchestration |
| **Next.js 16**     | React framework for the web app          | Server-side rendering, file-based routing, API routes, great DX           |
| **React 19**       | UI library                               | Component-based UI, latest features                                       |
| **Tailwind CSS 4** | Utility-first CSS framework              | Fast styling without writing custom CSS files                             |
| **Prisma 7**       | Database ORM (Object-Relational Mapper)  | Type-safe database queries, visual schema, auto-generated client          |
| **Supabase**       | Backend-as-a-Service (PostgreSQL + Auth) | Free tier, hosted Postgres, built-in auth, real-time                      |
| **Judge0**         | Code execution engine                    | Runs student code safely in sandboxed containers                          |
| **Sentry**         | Error tracking & performance monitoring  | Catches production errors with full stack traces and context              |
| **PostHog**        | Product analytics                        | Tracks user behavior, privacy-first, self-hostable                        |
| **TypeScript**     | Typed JavaScript                         | Catches bugs before runtime, better autocomplete                          |
| **ESLint**         | Code linter                              | Enforces code quality rules                                               |
| **Prettier**       | Code formatter                           | Auto-formats code to consistent style                                     |

---

## 📁 File-by-File Explanation

### Root Files

| File                  | Purpose                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `package.json`        | Monorepo name (`codemaster-edtech`), scripts (`build`/`dev`/`lint`), dev tools |
| `pnpm-workspace.yaml` | Tells pnpm: "treat `apps/*` and `packages/*` as workspace members"             |
| `turbo.json`          | Defines task pipeline — `build` waits for dependencies, `dev` runs forever. Declares `globalEnv` for `NODE_ENV` and `SENTRY_DSN` |
| `.npmrc`              | `auto-install-peers = true` — auto-installs peer deps to avoid errors          |
| `.env`                | **SECRETS!** Database URL, Supabase keys. **Never commit this.**               |
| `.gitignore`          | Files Git should never track (node_modules, .env, build output)                |
| `pnpm-lock.yaml`      | Exact dependency versions — auto-generated, committed to Git                   |

### Web App — Core Files (`apps/web/`)

| File                | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `package.json`      | Dependencies: Next.js, React, Supabase, Sentry, PostHog. Scripts: `dev`, `build`, `lint`, `check-types` |
| `next.config.ts`    | Next.js settings. Wrapped with `withSentryConfig()` for error tracking          |
| `tsconfig.json`     | TypeScript config. Extends shared `nextjs.json`. Defines `@/*` path alias       |
| `eslint.config.js`  | ESLint config. Uses shared Next.js rules from `@repo/eslint-config`             |
| `postcss.config.js` | PostCSS config. Enables Tailwind CSS processing via shared config               |

### Web App — Pages (`apps/web/app/`)

| File                  | Purpose                                                                       |
| --------------------- | ----------------------------------------------------------------------------- |
| `app/layout.tsx`      | Root HTML wrapper — sets font, metadata, PWA manifest, wraps with AuthProvider + AnalyticsProvider. **Server Component** (no hooks allowed) |
| `app/page.tsx`        | Landing page (`/`) — displays hero text + "Get Started" / "Sign In" CTA buttons |
| `app/auth/page.tsx`   | Authentication page (`/auth`) — renders the AuthForm component                |
| `app/home/page.tsx`   | Post-auth landing page (`/home`) — placeholder, will become the dashboard     |
| `app/globals.css`     | Global styles — dark/light mode CSS variables, background gradient             |

### Web App — Components (`apps/web/components/`)

| File                                    | Purpose                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `components/AuthForm.tsx`               | Multi-step auth form (OTP → Verify → Password). Supports email, phone, Google, Facebook OAuth. `'use client'` component |
| `components/providers/auth-provider.tsx` | Listens for Supabase auth state changes. Redirects to `/home` on `SIGNED_IN`. `'use client'` component |
| `components/providers/analytics-provider.tsx` | Initializes PostHog analytics client-side via `useEffect`. `'use client'` component |

### Web App — Libraries (`apps/web/lib/`)

| File              | Purpose                                                                         |
| ----------------- | ------------------------------------------------------------------------------- |
| `lib/supabase.ts` | Creates a Supabase browser client using `@supabase/ssr`. Used in all `'use client'` components for auth and data operations |
| `lib/posthog.ts`  | Initializes PostHog with API key from env. `autocapture: false` for children's privacy compliance |

### Web App — Config Files (`apps/web/`)

| File                      | Purpose                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| `sentry.client.config.ts` | Sentry browser-side init. `tracesSampleRate`: 1.0 dev / 0.2 prod       |
| `sentry.server.config.ts` | Sentry server-side init. Same rate config. Falls back to `NEXT_PUBLIC_SENTRY_DSN` |
| `public/manifest.json`    | PWA manifest — app name, icons (192/512), theme color, standalone mode  |

### Infrastructure Package (`packages/infrastructure/`)

| File                    | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `package.json`          | Dependencies: `prisma`, `@prisma/client`, `dotenv`                      |
| `prisma.config.ts`      | Loads `.env` from monorepo root → gives DATABASE_URL to Prisma          |
| `prisma/schema.prisma`  | **THE STAR** — defines all 7 database tables and their relationships    |
| `src/generated/prisma/` | Auto-generated Prisma Client (gitignored, created by `prisma generate`) |

### Shared Config Packages

| Package                       | Purpose                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `packages/typescript-config/` | Shared `tsconfig.json` files (`base.json`, `nextjs.json`, `react-library.json`) |
| `packages/eslint-config/`     | Shared ESLint rules (`base.js`, `next.js`, `react-internal.js`)                 |
| `packages/tailwind-config/`   | Shared Tailwind CSS config and PostCSS setup                                    |
| `packages/ui/`                | Shared React components (`Card`, `Gradient`)                                    |

---

## 🔐 Authentication Flow

### How Sign Up Works

```
User visits /auth
    ↓
Enters email or phone → Clicks "Send OTP"
    ↓
Supabase sends OTP to email (or SMS in future)
    ↓
User enters 6-digit OTP → Clicks "Verify"
    ↓
OTP verified → User enters password → Clicks "Complete Sign Up"
    ↓
Account created → AuthProvider detects SIGNED_IN event
    ↓
Redirects to /home
```

### How Sign In Works

```
User visits /auth?mode=signin
    ↓
Enters email or phone → OTP sent → OTP verified
    ↓
AuthProvider detects SIGNED_IN → Redirects to /home
```

### Social OAuth (Google/Facebook)

```
User clicks "Google" or "Facebook" button
    ↓
Redirected to provider's login page
    ↓
After auth, Supabase redirects back to /home
```

### Architecture

- **AuthProvider** (`components/providers/auth-provider.tsx`) — `'use client'` wrapper in layout.tsx that listens for `supabase.auth.onAuthStateChange`. Handles redirect on sign-in.
- **AuthForm** (`components/AuthForm.tsx`) — The actual sign-up/sign-in form UI. Multi-step: input → OTP → password.
- **Supabase Client** (`lib/supabase.ts`) — Creates a browser client using `@supabase/ssr` for cookie-based auth sessions.

---

## 📊 Monitoring & Analytics

### Sentry (Error Tracking)

| What              | Details                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Package           | `@sentry/nextjs` + `@sentry/tracing`                             |
| Client config     | `sentry.client.config.ts` — auto-loaded when app hydrates         |
| Server config     | `sentry.server.config.ts` — auto-loaded for API routes/SSR        |
| Next.js plugin    | `withSentryConfig()` in `next.config.ts`                          |
| Sample rate (dev) | 1.0 (capture everything)                                          |
| Sample rate (prod)| 0.2 (capture 20% to control costs)                                |

### PostHog (Product Analytics)

| What              | Details                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Package           | `posthog-js`                                                      |
| Init function     | `lib/posthog.ts` → `initPostHog()`                                |
| Initialized in    | `AnalyticsProvider` (client component, via `useEffect`)           |
| autocapture       | `false` — for children's data privacy compliance                  |
| api_host          | `https://app.posthog.com`                                         |

### PWA (Progressive Web App)

| What              | Details                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Manifest          | `public/manifest.json` — app name, icons, theme color             |
| Linked via        | `metadata.manifest` in `layout.tsx`                                |
| Theme color       | `#3b82f6` (blue) — set via `viewport.themeColor` in `layout.tsx`   |
| Install prompt    | Enabled via `apple-mobile-web-app-capable` and `mobile-web-app-capable` meta tags |

---

## 🗄️ Database Schema (7 Tables)

### How the Data Flows

```
Student signs up → User record created (with age gate check)
                        │
Student picks a course → Course → Topic (ordered list)
                                      │
                          ┌───────────┼───────────┐
                          │           │           │
                       Concept     3 MCQs    3 Problems
                       (HTML)       │           │
                                    │           │
                          Student answers → Progress updated
                          Student codes  → Submission created
                                              │
                                        Sent to Judge0
                                              │
                                        Results saved back
```

### Table Relationships

- **User** → has many **Progress** records (one per topic)
- **User** → has many **Submissions** (every code submission)
- **Course** → has many **Topics** (ordered by `order` field)
- **Topic** → has many **MCQs** (3 per topic)
- **Topic** → has many **Problems** (3 per topic, fill_blank → full_code → hard)
- **Topic** → has many **Progress** records (from different users)
- **Problem** → has many **Submissions** (from different users)

### DPDP Act 2023 Compliance

India's Digital Personal Data Protection Act requires:

- **Age gate**: Users under 13 cannot sign up
- **Parental consent**: Users aged 13-17 need parent's permission
- **Consent audit trail**: Store WHEN consent was given and parent's email

These fields are in the `User` model: `age`, `isMinor`, `parentalConsent`, `parentalConsentTimestamp`, `parentalEmail`

---

## 🔐 Environment Variables

### Root `.env` (used by Prisma/infrastructure)

| Variable                        | Where It's Used              | How to Get It                                                |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                  | Prisma (database connection) | Supabase Dashboard → Settings → Database → Connection string |
| `NEXT_PUBLIC_SUPABASE_URL`      | Web app (Supabase client)    | Supabase Dashboard → Settings → API → Project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web app (Supabase client)    | Supabase Dashboard → Settings → API → anon/public key        |
| `JUDGE0_URL`                    | Code execution               | Your Oracle Cloud VM IP (configured later)                   |

### Web App `.env` / `.env.local` (used by Next.js)

| Variable                        | Where It's Used                      | How to Get It                                       |
| ------------------------------- | ------------------------------------ | --------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase browser client              | Supabase Dashboard → Settings → API                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser client              | Supabase Dashboard → Settings → API                 |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry error tracking (client+server) | Sentry Dashboard → Project → Settings → Client Keys |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog analytics                    | PostHog Dashboard → Project → Settings              |
| `NEXT_PUBLIC_POSTHOG_HOST`      | PostHog API endpoint                 | Usually `https://us.posthog.com`                     |
| `NEXT_PUBLIC_APP_URL`           | Application URL (for redirects)      | Your Vercel/custom domain                            |
| `DATABASE_URL`                  | Prisma (if used in web app)          | Supabase Dashboard → Database → Connection string   |
| `JUDGE0_URL`                    | Code execution API                   | Your Oracle Cloud VM IP                              |

### Vercel Environment Variables

When deploying to Vercel, add ALL of these in **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_APP_URL
DATABASE_URL
JUDGE0_URL
```

> ⚠️ **Never commit `.env` or `.env.local` to Git.** They are in `.gitignore` for safety.

---

## 🧰 Commands Cheat Sheet

### Daily Development

```bash
# Start the dev server (runs at localhost:3001)
pnpm dev

# Format all code with Prettier
pnpm format

# Check for lint or code errors 
pnpm lint

# Check for TypeScript errors
pnpm check-types
```

### Database (run from packages/infrastructure/)

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes to Supabase
npx prisma db push

# Open visual database browser
npx prisma studio

# Pull existing database schema into Prisma
npx prisma db pull

# Create a migration file (for production)
npx prisma migrate dev --name <description>
```

### Build & Deploy

```bash
# Build everything for production
pnpm build

# Install all dependencies
pnpm install

# Add a package to a specific workspace
pnpm add <package> --filter web
pnpm add <package> --filter @repo/infrastructure
```

---

## 📋 What's Built vs What's Next

### ✅ Done (Phase 1 — Infrastructure + Monitoring + Auth)

1. Turborepo monorepo structure
2. Prisma 7 with Supabase PostgreSQL
3. 7 database models with full relations
4. DPDP Act 2023 compliance fields
5. All tables created in Supabase
6. **Sentry** error tracking (client + server, conditional sample rates)
7. **PostHog** product analytics (client-side, autocapture disabled)
8. **PWA** manifest + meta tags (Add to Home Screen support)
9. **Supabase Auth** — OTP-based sign up/sign in + Google/Facebook OAuth
10. **Auth pages** — `/auth` (sign up/sign in form), `/home` (post-auth landing)
11. **Provider architecture** — AuthProvider + AnalyticsProvider wrapping the app
12. **Path aliases** — `@/*` configured for clean imports

### 🔲 Next (Phase 2)

1. **Route Protection** — middleware to redirect unauthenticated users away from protected pages
2. **Age Gate UI** — age verification on sign-up form per DPDP Act
3. **Seed Data** — sample Python course with topics, MCQs, problems
4. **Code Editor** — CodeMirror (mobile) + Monaco (desktop) integration
5. **Judge0 Integration** — submit code → run → show results
6. **Dashboard** — replace `/home` placeholder with course list, progress tracker
