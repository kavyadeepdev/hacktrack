---
name: neon-cli
description: Manage Neon Postgres (auth, projects, branches, connection strings, psql, schema diff) for the HackTrack backend. Use when the user asks to set up, link, branch, inspect, or query the Neon database.
---

# Neon CLI skill

Neon CLI (`neon`, v5) manages the Postgres backend. Prefer it over the
dashboard for repeatable ops.

## Level 1 — Everyday

```bash
neon auth                  # login (alias: neon login)
neon me                    # confirm identity
neon link                  # link cwd to a project (writes .neon/)
neon projects list
neon branches list
neon connection-string --pooled   # DATABASE_URL value
neon psql
```

## Level 2 — Common

- `neon projects create --name hacktrack`
- `neon branches create --name <branch>`
- `neon checkout <branch>` — pin branch in local `.neon/` context
- `neon connection-string --role-name app --database-name hacktrack --pooled`
- `neon diff <branch>` — git-style schema diff (`neon diff --help`)
- `neon api [path]` — authenticated passthrough to any Neon API route
- `neon init` / `neon bootstrap` — scaffold + link (interactive)
- `neon mcp` / `neon plugins` / `neon skills` — install agent integrations

## Level 3 — Authoritative reference

```bash
neon --help
neon <command> --help     # e.g. neon projects --help, neon connection-string --help
man neon                  # man3 (/usr/share/man/man3/neon.3.gz)
```

If `neon <cmd> --help` and this card disagree, trust `--help` / `man`.
Repo workflows: `docs/neon.md`. Schema: `src/db/schema.ts`.
