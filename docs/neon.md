# Neon CLI

> Level 1 is below. Level 3 (authoritative): `neon --help`,
> `neon <command> --help`, `man neon`.

## Level 1 — Everyday commands

```bash
neon auth                    # log in (also: neon login)
neon me                      # verify who you are
neon link                    # link this dir to a Neon project (writes .neon/)
neon projects list           # list projects
neon branches list           # list branches of linked project
neon connection-string --pooled   # DATABASE_URL for .env.local
neon psql                    # open psql to the linked branch
```

First-time setup for HackTrack:

```bash
neon auth
neon link                    # pick the hacktrack project (or create one)
neon connection-string --pooled
# paste output as DATABASE_URL in .env.local (see .env.example)
npx drizzle-kit generate && npx drizzle-kit migrate
```

## Level 2 — Common operations

| Task | Command |
| --- | --- |
| Create project | `neon projects create --name hacktrack` |
| Create dev branch | `neon branches create --name dev` |
| Pin branch locally | `neon checkout dev` |
| Role-scoped string | `neon connection-string --role-name app --database-name hacktrack --pooled` |
| Branch schema diff | `neon diff main...dev` (see `neon diff --help`) |
| Call API directly | `neon api /projects` |
| Ask about Neon | `neon ask "how do pooled connections work?"` |

Branch-per-preview workflows map well to Vercel preview deploys:
create a branch per feature, migrate it, point the preview env at it.

## Level 3 — Full reference

```bash
neon --help                  # all commands
neon projects --help         # sub-commands (create/list/get/update/delete/recover)
neon connection-string --help  # --role-name --database-name --pooled --psql --ssl …
man neon                     # man3 page
```

Agent skill: `.agents/skills/neon-cli/SKILL.md`.
