# GitHub CLI (`gh`)

> Level 1 is below. Level 3 (authoritative): `gh --help`,
> `gh <command> --help`, `man gh`.

## Level 1 — Everyday commands

```bash
gh auth login                # authenticate (check: gh auth status)
gh repo view --web           # open repo in browser
gh status                    # your issues/PRs/notifications
gh pr create --fill          # open a PR for the current branch
gh pr checks                 # CI status for the current PR
```

Branch → PR flow used in this repo:

```bash
git checkout -b feat/<short-name>
git add -A && git commit -m "feat: <what>"
git push -u origin feat/<short-name>
gh pr create --fill
gh pr checks --watch
```

## Level 2 — Common operations

| Task | Command |
| --- | --- |
| Clone | `gh repo clone <owner>/<repo>` |
| New repo from here | `gh repo create --source . --push` |
| Checkout someone’s PR | `gh pr checkout <number>` (alias: `gh co`) |
| File an issue | `gh issue create --title "…" --body "…"` |
| Release | `gh release create v0.1.0 --generate-notes` |
| Search | `gh search repos hackathon tracker --stars ">100"` |
| API escape hatch | `gh api repos/{owner}/{repo}` |

## Level 3 — Full reference

```bash
gh --help                    # core + actions + additional commands
gh reference                 # comprehensive reference topic
gh environment               # env vars gh respects
gh formatting                # JSON export formatting
man gh                       # man1 page
```

Agent skill: `.agents/skills/github-cli/SKILL.md`.
