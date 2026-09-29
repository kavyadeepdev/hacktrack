# Vercel CLI

> Level 1 is below. Level 3 (authoritative): `vercel --help`,
> `vercel <command> --help`. Note: **no man page ships** with Vercel CLI
> (`man vercel` → “No manual entry”). Use `--help`.

## Level 1 — Everyday commands

```bash
vercel login                 # authenticate
vercel link                  # link this dir to a Vercel project
vercel pull                  # pull project settings + env to .vercel/
vercel dev                   # local dev with Vercel env
vercel                       # deploy a preview
vercel --prod                # deploy to production
```

First-time setup for HackTrack:

```bash
vercel login
vercel link
vercel pull
vercel env add DATABASE_URL production   # paste pooled Neon string
vercel --prod
```

## Level 2 — Common operations

| Task | Command |
| --- | --- |
| List deployments | `vercel ls` / `vercel list` |
| Inspect one | `vercel inspect <url-or-id>` |
| Logs | `vercel logs <url-or-id>` |
| Promote preview → prod | `vercel promote <url-or-id>` |
| Roll back | `vercel rollback <url-or-id>` |
| Add env (all) | `vercel env add DATABASE_URL production preview development` |
| Pull env to file | `vercel pull --env .env.local` (check flags via `--help`) |
| Domains | `vercel domains --help` / `vercel alias --help` |

## Level 3 — Full reference

```bash
vercel --help
vercel deploy --help
vercel env --help
vercel link --help
```

Agent skill: `.agents/skills/vercel-cli/SKILL.md`.
