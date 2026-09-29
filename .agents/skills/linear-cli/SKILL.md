---
name: linear-cli
description: Plan, split, pull, and update HackTrack work via Linear CLI. Use when the user gives a list of features to split into issues, or when an agent needs to pull its assigned issue, check allowed files, or mark work done.
---

# Linear CLI skill

`linear` (@schpet/linear-cli) is the interface to the HackTrack backlog.
Prefer it over the Linear web UI for repeatable flows. Team `PAY`, project
`HackTrack`. Auth comes from the `LINEAR_API_KEY` machine env var — never
paste or commit the key.

## Level 1 — Everyday

```bash
linear issue mine
linear issue view PAY-17
linear issue start PAY-17
linear issue update PAY-17 -s Done
```

## Level 2 — Common

- `linear issue query --team PAY --project HackTrack` — whole backlog
- `linear issue query --team PAY --label track-a` (or `track-b`) — one track
- `linear issue create --team PAY --project HackTrack -a <user> -l <track>
  -t "[<ID>] <Title>" -d "Owner: …. Allowed files: …. See docs/features.md
  <ID>. Branch: person/<name>."` — split a new feature into an issue
- `linear issue update PAY-17 -s "In Progress"` / `-s Done`
- `linear issue update PAY-17 --add-label added` (incremental, keeps others)
- `linear issue update PAY-17 -a <user>` — reassign by mutual agreement
- `linear issue comment PAY-17 --body "Done in <PR>. features.md <ID> -> [x]."`
- `linear label create -t PAY -n <name> -c "#HEX" -d "…"`
- `linear team members PAY` — resolve assignee usernames

## Splitting a new feature set (the repo flow)

1. Read `docs/features.md`; assign IDs (`A…` → Shrihari/track-a,
   `B…` → Kavyadeep/track-b); append `- [ ]` entries with how-to-implement
   + owned files.
2. Create one issue per feature (title `[<ID>] <Title>`, label, assignee,
   allowed files + branch in description).
3. Report issue IDs. Agents then pull via `issue mine` / `view` / `start`
   and close with `issue update <id> -s Done` in the same PR that flips the
   `docs/features.md` box.

## Level 3 — Authoritative reference

```bash
linear --help
linear <command> --help        # e.g. linear issue --help
```

No man page ships with this CLI — `--help` is authoritative. If this card
and the tool disagree, trust the tool. Repo workflows: `docs/linear.md`.
