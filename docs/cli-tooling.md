# CLI tooling — progressive disclosure

Three CLIs are first-class in this repo: **neon** (database), **vercel**
(hosting), **gh** (version control) — plus **linear** (task tracking).
Agent guidance lives in skill cards:

- `.agents/skills/neon-cli/SKILL.md`
- `.agents/skills/vercel-cli/SKILL.md`
- `.agents/skills/github-cli/SKILL.md`
- `.agents/skills/linear-cli/SKILL.md`

## How to read these docs (3 levels)

- **Level 1 — Just do it**: the top “Everyday commands” block in each
  `docs/<tool>.md`. Copy-paste safe for the 80% case.
- **Level 2 — I need a flag**: the “Common operations” tables in the same
  file (`--pooled`, `--prod`, `-b`, `-r`, …).
- **Level 3 — Full reference**: the tool’s own help and man pages —
  always authoritative over these docs:
  - `neon --help`, `neon <cmd> --help`, `man neon` (`/usr/share/man/man3/neon.3.gz`)
  - `vercel <cmd> --help` (no man page ships with Vercel CLI — use `--help`)
  - `gh <cmd> --help`, `man gh` (`/usr/share/man/man1/gh.1.gz`)
  - `linear <cmd> --help` (no man page ships with Linear CLI — use `--help`)

## Which tool for what?

| Need | Tool | Start |
| --- | --- | --- |
| Create/link DB, get connection string, branch DB | `neon` | `docs/neon.md` |
| Link project, pull env, deploy, inspect logs | `vercel` | `docs/vercel.md` |
| Auth, clone, branch, PR, issue, release | `gh` | `docs/github.md` |
| Pull my task, split features, mark done | `linear` | `docs/linear.md` |

Rule: prefer the CLI over the dashboard for repeatable ops, and paste the
exact command you ran into PR descriptions when it changes infra.
