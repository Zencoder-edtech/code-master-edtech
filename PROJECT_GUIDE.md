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
| `turbo.json`          | Defines task pipeline — `build` waits for dependencies, `dev` runs forever     |
| `.npmrc`              | `auto-install-peers = true` — auto-installs peer deps to avoid errors          |
| `.env`                | **SECRETS!** Database URL, Supabase keys. **Never commit this.**               |
| `.gitignore`          | Files Git should never track (node_modules, .env, build output)                |
| `pnpm-lock.yaml`      | Exact dependency versions — auto-generated, committed to Git                   |

### Web App Files (`apps/web/`)

| File                | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `package.json`      | Dependencies: Next.js, React, Supabase SSR. Scripts: `dev`, `build` |
| `next.config.ts`    | Next.js settings. Currently skips TS errors during build            |
| `tsconfig.json`     | TypeScript config. Extends shared `nextjs.json`                     |
| `eslint.config.js`  | ESLint config. Uses shared Next.js rules                            |
| `postcss.config.js` | PostCSS config. Enables Tailwind CSS processing                     |
| `app/layout.tsx`    | Root HTML wrapper — sets font, metadata, wraps all pages            |
| `app/page.tsx`      | Homepage (currently Turborepo template — will be replaced)          |
| `app/globals.css`   | Global styles — dark/light mode, background gradient                |

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

## 🔐 Environment Variables

Your `.env` file at the project root contains:

| Variable                        | Where It's Used              | How to Get It                                                |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                  | Prisma (database connection) | Supabase Dashboard → Settings → Database → Connection string |
| `NEXT_PUBLIC_SUPABASE_URL`      | Web app (Supabase client)    | Supabase Dashboard → Settings → API → Project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web app (Supabase client)    | Supabase Dashboard → Settings → API → anon/public key        |
| `JUDGE0_URL`                    | Code execution               | Your Oracle Cloud VM IP (configured later)                   |

> ⚠️ **Never commit `.env` to Git.** It's in `.gitignore` for safety.

---

## 📋 What's Built vs What's Next

### ✅ Done (Phase 1)

1. Turborepo monorepo structure
2. Prisma 7 with Supabase PostgreSQL
3. 7 database models with full relations
4. DPDP Act 2023 compliance fields
5. All tables created in Supabase

### 🔲 Next (Phase 2)

1. **Supabase Auth** — signup/login with email + password
2. **Auth Pages** — signup form with age gate UI, login form
3. **Route Protection** — middleware to redirect unauthenticated users
4. **Seed Data** — sample Python course with topics, MCQs, problems
5. **Code Editor** — CodeMirror (mobile) + Monaco (desktop) integration
6. **Judge0 Integration** — submit code → run → show results
