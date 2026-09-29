# Data model

Source of truth in code: `src/lib/types.ts` (app shape) and
`src/db/schema.ts` (Postgres shape). They are intentionally 1:1.

## Pipeline (`status`)

| Value | Meaning |
| --- | --- |
| `reviewing` | Discovered, evaluating fit |
| `planning_to_apply` | Shortlisted, prepping application |
| `applied` | Application submitted, awaiting decision |
| `accepted` | In — prep for the event |
| `attended` | Went / participated |
| `declined` | Rejected or withdrew |
| `skipped` | Decided not to pursue |

## Outcome (`result`, meaningful once `attended`)

`none` · `won` · `finalist` · `submitted_no_place` · `did_not_submit` · `no_show`

Plus free-text `rank` (e.g. `1st`, `Top 8 / 60`), `prize`, `projectName`,
`projectUrl`, `repoUrl`, `technologies[]`, `teamMembers[]`.

## Reflection

`notes` (ongoing, anytime) and `learnings` (retrospective after attending).
The detail page (`/hackathons/[id]`) edits both; full multi-entry journals
are a future extension, not a schema change.

## Postgres (Neon)

Table `hackathons` with enums `hackathon_status` / `result_status`
(see `src/db/schema.ts`). `technologies` / `team_members` are `text[]`.
Timestamps are `timestamptz` with `defaultNow()`; `updatedAt` is refreshed
by the app layer on write.

Migrations:

```bash
npx drizzle-kit generate   # SQL preview into ./drizzle/
npx drizzle-kit migrate    # apply to DATABASE_URL
```
