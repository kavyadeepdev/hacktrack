# Linear CLI (`linear`) — HackTrack workflow

> Level 1 is below. Level 3 (authoritative): `linear --help`,
> `linear <cmd> --help`. No man page ships with this CLI (same as Vercel) —
> `--help` is the reference. If this doc and the tool disagree, trust the tool.
> CLI: `@schpet/linear-cli@2.6.0` (installed globally).
>
> Setup: `LINEAR_API_KEY` is set as a machine env var. Team key: `PAY`.
> Project: `HackTrack`. Labels: `track-a` (Shrihari), `track-b` (Kavyadeep),
> `added` (maintainer-added stretch). Members: `shrihariviswanathan`,
> `devkavyadeep`.

## The flow this repo uses

```
You give an agent a list of features
  → agent updates docs/features.md (+ docs/* as needed)
  → agent splits the work as Linear issues (assignee + label + allowed files)
  → you pull with multiple agents, each works its own issue(s)
```

### Adding a new set of features (agent instructions)

1. Read `docs/features.md` and the target Linear state
   (`linear issue query --team PAY --project HackTrack`).
2. Append each feature to `docs/features.md` as `- [ ] **<ID> — Title
   (PAY-x).**` with owner, how-to-implement, and owned files. IDs continue
   the sequence (`A10…` for Shrihari's area, `B14…` for Kavyadeep's;
   pre-event/teams/roles/registration/timeline → Track A, workspace/AI/
   deadlines/tech-detect/media/notes/results → Track B).
3. Create one issue per feature:
   `linear issue create --team PAY --project HackTrack -a <user>
   -l track-a|track-b [-l added] -t "[<ID>] <Title>" -d "Owner: ….
   Allowed files: …. See docs/features.md <ID>. Branch: person/<name>."`
4. Report the new issue IDs; flip `docs/features.md` boxes only when the
   work lands.

### Pulling work with agents (one agent per feature)

```bash
linear issue mine                       # my assigned issues
linear issue view PAY-17                # read: description lists allowed files
linear issue start PAY-17               # mark In Progress
# ... implement ONLY the files in the issue description ...
linear issue update PAY-17 -s Done      # move to Done in the same PR
```

## Hard file-ownership rule (was `docs/work_divison_for_team.md`, now enforced here + per-issue)

- An agent may create/edit ONLY files listed in its issue description.
- It must NEVER touch the other track's files or FROZEN files:
  `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/*`,
  `src/lib/utils.ts`, `src/db/client.ts`, configs, `public/*`, `.agents/*`.
- Track A owns existing tracker UI (`src/app/hackathons/**`,
  `src/components/hackathon/*`, `src/components/layout/*`,
  `src/lib/store|seed|constants|types(additive)|db/schema(additive)`).
  Track B builds 100% greenfield and edits NO existing file.
- Need a file outside your issue? Stop, comment on the issue, let the owner
  implement it. Duplication beats shared edits.
- Branches: `person/shrihari`, `person/kavyadeep`. Before PR:
  `git diff --name-only origin/main...HEAD` — every path must be yours.

## Level 1 — Everyday commands

```bash
linear team list                        # confirm PAY
linear issue mine                       # my work
linear issue view PAY-17                # read one issue
linear issue start PAY-17               # begin
linear issue update PAY-17 -s Done      # finish (same PR as the code)
linear issue comment PAY-17 --body "Done in <PR>. features.md B3 -> [x]."
```

## Level 2 — Common operations

| Task | Command |
| --- | --- |
| Query one track | `linear issue query --team PAY --label track-a` |
| Whole project | `linear issue query --team PAY --project HackTrack` |
| Create issue | `linear issue create --team PAY --project HackTrack -t "…" -d "…" -l track-b -a devkavyadeep` |
| Reassign | `linear issue update PAY-17 -a shrihariviswanathan` |
| Add label (keep others) | `linear issue update PAY-17 --add-label added` |
| Move state | `linear issue update PAY-17 -s "In Progress"` / `-s Done` |
| Labels setup | `linear label create -t PAY -n <name> -c "#HEX" -d "…"` |

Rules: title MUST be `[<ID>] <Title>`; every issue gets `track-a` or
`track-b` (+ `added` for stretch); description MUST contain owner, allowed
files, `docs/features.md` ID, and branch. After code lands: flip the box in
`docs/features.md` AND move the issue to Done — both, same PR.

## Level 3 — Full reference

```bash
linear --help
linear issue --help            # mine/list/query/view/start/update/comment/…
linear issue create --help     # -t -d -l -a --team --project --priority -s
linear issue update --help     # -t -d -l/--add-label -a -s --team --project
linear team --help             # list/members
linear project --help          # list/create
linear label --help            # list/create/delete
```

## Seed record — the 22 issues (already created, for reference)

Track A — Shrihari (`-a shrihariviswanathan -l track-a`):
`[A1]` PAY-6 · `[A2]` PAY-7 · `[A3]` PAY-8 · `[A4]` PAY-9 · `[A5]` PAY-10 ·
`[A6]` PAY-11 · `[A7]` PAY-12 · `[A8]` PAY-13 · `[A9]` PAY-14 (+`added`).
Track B — Kavyadeep (`-a devkavyadeep -l track-b`):
`[B1]` PAY-15 · `[B2]` PAY-16 · `[B3]` PAY-17 · `[B4]` PAY-18 ·
`[B5]` PAY-19 · `[B6]` PAY-20 · `[B7]` PAY-21 · `[B8]` PAY-22 ·
`[B9]` PAY-23 · `[B10]` PAY-24 · `[B11]` PAY-25 · `[B12]` PAY-26 ·
`[B13]` PAY-27 (+`added`). All under `--team PAY --project HackTrack`.
