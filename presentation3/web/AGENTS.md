# Licentra — Enterprise Software Governance UI

Fullstack Enterprise Software Governance and License Management Application ported to **Next.js (App Router)** with **Prisma ORM**, **Tailwind CSS v4**, and **Clerk**.

## Development Server

- `bun run dev` (starts on port 3000 by default, or `-p <port>`)
- `bun run build` (production Next.js build with Turbopack)
- `bun run start` (production Next.js runner)

## Project Structure (Next.js App Router)

- `src/app/layout.tsx` - Root layout with global typography, meta tags, and `AppAuthProvider`
- `src/app/page.tsx` - Primary application entrypoint rendering the interactive dashboard
- `src/app/api/` - Next.js Route Handlers for fullstack operations:
  - `api/db/status/route.ts` - Database health & connection status
  - `api/governance/overview/route.ts` - Governance metrics, KPI cards, radar, vendor spend
  - `api/licenses/route.ts` - License inventory GET & creation POST
  - `api/licenses/[id]/route.ts` - License PUT (edit) & DELETE
  - `api/allocations/directory/route.ts` - Employees & devices directory
  - `api/allocations/route.ts` - Provision seat allocation POST
  - `api/allocations/[id]/route.ts` - Reclaim / revoke seat allocation DELETE
  - `api/renewals/route.ts` - Contract renewal workflow POST
  - `api/audits/run/route.ts` - Automated compliance audit runner POST
  - `api/vendors/route.ts` - Enterprise vendor catalog GET
  - `api/db/seed/route.ts` - Database reset & reseed POST
- `src/lib/prisma.ts` - Prisma Client singleton
- `src/lib/server-api.ts` - Modular backend domain functions
- `src/lib/db.ts` - Client-side API caller functions & types
- `src/lib/clerk.tsx` - Clerk authentication provider & profile widgets
- `src/lib/neon.ts` - Optional serverless PostgreSQL integration
- `src/components/` - React UI component library (Modals, Allocations, Renewals, Dashboards, Catalogs)
- `src/index.css` - Global design tokens, typography, and Tailwind CSS v4 styling
- `prisma/schema.prisma` - 3NF Relational Database Schema (MySQL / PostgreSQL)
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration with `@tailwindcss/postcss`

## Dependencies

- Runtime: Next.js 16+, React 19, React DOM 19
- Database & ORM: Prisma Client 6+, MySQL / Neon Postgres
- Auth: Clerk React
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`
- Icons: Lucide React
