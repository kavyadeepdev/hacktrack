# Architecture

## Stack

- **Next.js 16** (App Router, `src/` dir) + **TypeScript** + **Tailwind v4**
- **shadcn/ui** (New York style, `components.json`) — primitives in `src/components/ui/`
- **Neon Postgres** via `@neondatabase/serverless` + **Drizzle ORM**
- **Vercel** hosting, **GitHub** version control

## Folder structure

```
src/
  app/                    # routes (mobile-first pages)
    layout.tsx            # AppHeader + BottomNav shell, viewport, manifest ref
    page.tsx              # dashboard: stats, up-next, recent results
    hackathons/
      page.tsx            # filterable tracker list
      new/page.tsx        # create form
      [id]/page.tsx       # detail: status/result editing, rank, learnings
  components/
    ui/                   # shadcn primitives (button, card, badge, input…)
    layout/               # app-header.tsx, bottom-nav.tsx
    hackathon/            # status-badge, hackathon-card, hackathon-form, stats-strip
  lib/
    types.ts              # Hackathon, HackathonStatus, ResultStatus
    constants.ts          # labels + select options
    seed.ts               # demo entries
    store.ts              # localStorage MVP store (useHackathons)
    utils.ts              # cn()
  db/
    schema.ts             # Drizzle + Neon table + enums
    client.ts             # lazy getDb() (throws helpfully without DATABASE_URL)
docs/                     # this folder
.agents/skills/           # CLI skill cards (neon-cli, vercel-cli, github-cli)
drizzle.config.ts         # drizzle-kit config (DATABASE_URL)
```

## Conventions

- **Mobile first**: base styles target ~360px; `sm:` breakpoint enhances.
  Touch targets ≥ 44px (`min-h-[44px]` on buttons/inputs/selects).
  Bottom nav is `sm:hidden`; content column is `max-w-2xl`.
- **Server vs client**: pages reading/writing the MVP store are
  `"use client"` (`useHackathons`). DB access (`src/db/*`, future server
  actions) stays server-only — never import `getDb()` into client components.
- **Types first**: change `src/lib/types.ts` + `src/db/schema.ts` +
  `docs/data-model.md` together.
- **No emojis** in UI or code unless requested.

## Data path (MVP → Neon)

1. **Now (MVP)**: `useHackathons()` persists to `localStorage`
   (`hacktrack:hackathons:v1`), seeded from `src/lib/seed.ts`.
   Works with zero backend config.
2. **Next**: run the Neon setup in `docs/neon.md`, set `DATABASE_URL`,
   `npx drizzle-kit generate && npx drizzle-kit migrate`, then replace
   store calls with server actions using `getDb()` (same `Hackathon` shape).

## PWA

Deferred by design — see `docs/pwa-roadmap.md`. The layout already sets
`viewportFit: cover`, safe-area padding on the bottom nav, theme color,
and references `/manifest.webmanifest` (stub in `public/`).
