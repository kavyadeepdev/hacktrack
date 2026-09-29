# HackTrack

Mobile-first web app to track hackathons end to end: **reviewing →
planning to apply → applied → accepted → attended**, plus results, rank,
notes, and learnings.

Stack: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui · Neon Postgres
(Drizzle) · Vercel hosting · GitHub version control. PWA is a deferred
milestone (see `docs/pwa-roadmap.md`).

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

The MVP persists to `localStorage` — no backend config needed.

## Connect Neon (when ready)

```bash
neon auth && neon link
neon connection-string --pooled   # → DATABASE_URL in .env.local
npx drizzle-kit generate && npx drizzle-kit migrate
```

## Deploy

```bash
vercel link && vercel pull
vercel env add DATABASE_URL production
vercel --prod
```

## Docs

Start at [`docs/README.md`](docs/README.md). Agent guide: `AGENTS.md`.
CLI skills: `.agents/skills/{neon-cli,vercel-cli,github-cli}/SKILL.md`.

## Verify

```bash
npm run lint
npm run build
```
