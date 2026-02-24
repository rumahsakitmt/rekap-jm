# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMART SIMRS (Rekap JM) — a hospital information system for RSUD Mamuju Tengah. Handles medical record recaps for outpatient (rawat jalan), inpatient (rawat inap), pharmacy, tariffs, IGD triage, and claims (klaim). Built with Better-T-Stack.

## Tech Stack

- **Runtime:** Bun
- **Monorepo:** Turborepo with Bun workspaces (`apps/web`, `apps/server`)
- **Server:** Hono + tRPC v11 + Drizzle ORM + MySQL (via mysql2)
- **Web:** React 19 + Vite + TanStack Router (file-based) + TanStack Query + Zustand
- **UI:** shadcn/ui (new-york style) + Tailwind CSS v4 + Radix UI + Lucide icons
- **Validation:** Zod v4 (shared between client/server)
- **Forms:** TanStack React Form with custom `createFormHook` in `apps/web/src/hooks/form.ts`

## Commands

```bash
bun dev              # Start both web and server (turbo)
bun dev:web          # Web only (Vite, port 3001)
bun dev:server       # Server only (Bun --hot)
bun build            # Production build (both apps)
bun check-types      # TypeScript type checking (both apps)

# Database (Drizzle)
bun db:push          # Push schema to database
bun db:generate      # Generate migrations
bun db:migrate       # Run migrations
bun db:studio        # Open Drizzle Studio
```

No linter, formatter, or test framework is configured.

## Architecture

### Monorepo Layout

- `apps/web` — React SPA frontend (Vite, base path `/simrs`)
- `apps/server` — Hono API server (runs on Bun, tRPC at `/trpc/*`)

Type sharing: the web app uses a direct TypeScript project reference to `apps/server` (no shared package). The web tsconfig references `../server` to import `AppRouter` type.

### Server

- **Entry:** `apps/server/src/index.ts` — Hono with CORS, logger, static files (`/uploads/*`), tRPC handler
- **Routers:** `apps/server/src/routers/` — one file per domain (rawatJalan, rawatInap, obat, tarif, igd, triase, dokter, poliklinik, kamar, bangsal, stock, pegawai, csvUpload, bridgingSep)
- **DB Schema:** `apps/server/src/db/schema/` — 45+ Drizzle table definitions for MySQL
- **DB Connection:** `apps/server/src/db/index.ts` — uses individual env vars (`DATABASE_HOST`, `DATABASE_USER`, `DATABASE_NAME`, `DATABASE_PASSWORD`, `DATABASE_PORT`)

### Web

- **Entry:** `apps/web/src/main.tsx`
- **Routing:** TanStack Router file-based routing in `apps/web/src/routes/`. Route tree auto-generated at `routeTree.gen.ts`. Routes export `Route` via `createFileRoute()`.
- **tRPC Client:** `apps/web/src/utils/trpc.ts` — uses `httpBatchLink` to `VITE_SERVER_URL/trpc`, global error toast via Sonner
- **tRPC Query Pattern:** `useQuery(trpc.routerName.procedureName.queryOptions({...}))`
- **State:** Zustand stores in `apps/web/src/stores/` for filter/pagination/UI state. URL search params validated with Zod for data pages.
- **Components:** Domain-organized in `apps/web/src/components/` (e.g., `rawat-jalan/`, `rawat-inap/`, `igd/`, `tarif/`, `stock/`). UI primitives in `components/ui/` (shadcn).
- **PDF Reports:** `@react-pdf/renderer` for rawat jalan and rawat inap reports
- **Theme:** Dark mode default, OKLCH color space, configured via CSS variables in `index.css`

### Key Conventions

- Import alias `@/*` maps to `./src/*` in both apps
- Layout routes use `<Outlet />` pattern
- Currency formatting uses Indonesian locale (IDR)
- Tailwind CSS v4 uses CSS-first configuration (no `tailwind.config.js`)
- shadcn components added via: `bunx --bun shadcn@latest add <component>` (from `apps/web/`)
- No authentication is implemented (context returns `{ session: null }`)

### Environment Variables

**Server** (`apps/server/.env`): `CORS_ORIGIN`, `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_NAME`, `DATABASE_PASSWORD`, `DATABASE_PORT`, `DATABASE_URL` (for Drizzle Kit)

**Web** (`apps/web/.env`): `VITE_SERVER_URL`
