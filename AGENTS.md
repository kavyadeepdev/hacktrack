<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HackTrack — agent guide

Mobile-first hackathon tracker: Next.js 16 (App Router, `src/`) +
TypeScript + Tailwind v4 + shadcn/ui (New York). Neon Postgres via
Drizzle, Vercel hosting, GitHub version control.

## Where things live

- Routes: `src/app/` (`page.tsx` dashboard, `hackathons/` list/new/`[id]`)
- UI: `src/components/ui/` (shadcn primitives), `layout/` (header, bottom
  nav), `hackathon/` (cards, form, badges, stats)
- Domain: `src/lib/types.ts` + `constants.ts` + `store.ts` (localStorage
  MVP) + `seed.ts`; DB: `src/db/schema.ts` + `client.ts`
- Docs: `docs/` (start at `docs/README.md`); CLI skills:
  `.agents/skills/{neon-cli,vercel-cli,github-cli}/SKILL.md`

## Rules

- Mobile first: base styles for ~360px, `sm:` enhances; touch targets ≥
  44px; content column `max-w-2xl`; bottom nav is mobile-only (`sm:hidden`).
- `src/db/*` and future server actions are server-only — never import
  `getDb()` from `"use client"` components.
- Change `src/lib/types.ts`, `src/db/schema.ts`, `docs/data-model.md`
  together. No emojis unless requested.
- Data path: MVP persists via `useHackathons()` (localStorage key
  `hacktrack:hackathons:v1`). Neon wiring: `docs/neon.md` → set
  `DATABASE_URL` → `npx drizzle-kit generate && npx drizzle-kit migrate`.

## CLI progressive disclosure

- Level 1 (everyday) + Level 2 (flags): `docs/cli-tooling.md` and
  `docs/{neon,vercel,github}.md`.
- Level 3 (authoritative): `neon --help` / `man neon`;
  `vercel <cmd> --help` (no man page exists); `gh --help` / `man gh`.
  Trust the tool over docs on conflict.

## Verify

```bash
npm run lint
npm run build
```
