---
name: vercel-cli
description: Link, develop, env-manage, and deploy the HackTrack Next.js app with Vercel CLI. Use when the user asks to log in, link, preview, promote, roll back, inspect logs, or manage domains/env.
---

# Vercel CLI skill

Vercel CLI (`vercel`, v60) deploys and operates the hosted app.
Default command is `deploy`: bare `vercel` = preview, `vercel --prod` = production.

## Level 1 — Everyday

```bash
vercel login
vercel link
vercel pull                  # project settings + env
vercel dev                   # local dev with cloud env
vercel                       # preview deploy
vercel --prod                # production deploy
```

## Level 2 — Common

- `vercel ls` — list deployments
- `vercel inspect <url|id>` — deployment details
- `vercel logs <url>` — deployment logs
- `vercel promote <url|id>` — promote preview to current
- `vercel rollback <url|id>` — revert to previous deployment
- `vercel redeploy <url|id>` — rebuild a previous deployment
- `vercel env add <NAME> production|preview|development`
- `vercel domains --help` / `vercel alias --help` — custom domains
- `vercel build` — local build into `./vercel/output`

## Level 3 — Authoritative reference

```bash
vercel --help
vercel <command> --help     # e.g. vercel deploy --help, vercel env --help
```

Note: **no man page** ships with Vercel CLI (`man vercel` has no entry).
`--help` is authoritative. Repo workflows: `docs/vercel.md`.
