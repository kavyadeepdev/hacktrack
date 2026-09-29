---
name: github-cli
description: Work with GitHub repos, branches, PRs, issues, releases, and search via gh CLI. Use when the user asks to auth, clone, branch, open/check/merge PRs, file issues, or cut releases.
---

# GitHub CLI skill

`gh` (v2) is the interface to GitHub version control. Prefer it over
clicking through the web UI for repeatable flows.

## Level 1 — Everyday

```bash
gh auth login
gh auth status
gh status
gh repo view --web
gh pr create --fill
gh pr checks
```

## Level 2 — Common

- `gh repo clone <owner>/<repo>`; `gh repo create --source . --push`
- `gh pr checkout <number>` (alias `gh co`)
- `gh pr view --web` / `gh pr merge --squash`
- `gh issue create --title "…" --body "…"` / `gh issue list`
- `gh release create v0.1.0 --generate-notes`
- `gh search repos <query> --stars ">100"`
- `gh api repos/{owner}/{repo}` — authenticated API escape hatch
- `gh browse` — open current repo/branch/file in browser

## Level 3 — Authoritative reference

```bash
gh --help
gh <command> --help         # e.g. gh pr --help, gh repo --help
gh reference                # comprehensive command reference
gh environment              # env vars
gh formatting               # JSON output formatting
man gh                      # man1 (/usr/share/man/man1/gh.1.gz)
```

If this card and `gh --help` / `man gh` disagree, trust the tool.
Repo workflows: `docs/github.md`.
