# Work division for team — hard file-ownership rules

Owners: **Shrihari (Track A)** and **Kavyadeep (Track B)**.
Location: `docs/work_divison_for_team.md` (this file).

> HARD RULE: A person may create/edit ONLY files in their own list below.
> They must NEVER create, edit, rename, move, or delete a file owned by the
> other person or a FROZEN file. If you need something in the other person's
> area, open an issue and let them implement it. Duplication is preferred
> over shared edits.
>
> Branch rule: `person/shrihari` and `person/kavyadeep` only. Before merging,
> run `git diff --name-only origin/main...HEAD` and confirm every path is in
> your own "may touch" set. Any path outside your set = rejected PR.

Feature development model: each track ships independently behind its own
routes/components/lib/db tables, joined only by the hackathon `id: string`.
No cross-track schema FK edits to the core `hackathons` table.

---

## 1. Feature split

### Track A — Shrihari: lifecycle, registration gate, teams + RBAC, timeline

Owns all of this, end to end:

1. Add / edit / list hackathons being participated in (core CRUD).
2. Core event links (event URL, registration URL) on the tracker form.
3. Team code / team formation, team creation, invites.
4. Role-based access (roles, permissions, guards, role badge, member list).
5. Payment-checkbox gate: unchecked = pre-hackathon minimal view;
   checked = reveals full workspace entry + all Track A fields.
6. Delete hackathon (pre-hackathon only, confirm dialog).
7. Post-hackathon timeline chart: accumulated list of participated
   hackathons with details intact, chronological.
8. Dashboard tracker list + detail shell (`src/app/hackathons/**`).
9. ADDED (by maintainer, suits this track): team invite codes with expiry
   + access audit entries (who joined / role changed / when). Fits RBAC area.

### Track B — Kavyadeep: build workspace, intelligence, reminders, outcomes

Owns all of this, end to end, inside `/workspace` routes only:

1. Deadlines of the hackathon (multiple deadlines per hackathon).
2. Reminders before deadlines (banner + list + due-soon logic).
3. Chat window with multiple lines: ideate + feature suggestions, each with
   checkbox, groupable into Implemented / Dropped.
4. Video link upload location.
5. PPT upload location (link).
6. Problem statements relevant to the hackathon.
7. Resources for the same (docs, APIs, datasets — link library).
8. GitHub link upload (enhanced project repo input).
9. Tech-stack detection from the GitHub code (badges + mapping).
10. Result win/lose + prize money won.
11. Personalized notes per hackathon (what learnt, what worked, learnings).
12. LLM parse: paste text or paste website URL → structured hackathon draft.
13. ADDED (by maintainer, suits this track): submission-readiness checklist
    + `.ics` calendar export for deadlines. Fits reminders/outcomes area.

### How the "payment reveals everything" + "timeline accumulates" flows work without shared edits

- Payment gate lives ONLY in Track A files. When `paymentConfirmed = true`,
  Track A reveals its own full fieldset AND renders a deep link to
  `/workspace/[hackathonId]` (Track B). Track B fields are never inlined
  into Track A pages — they are revealed via that link. This satisfies
  "once the payment checkbox is clicked it should reveal the thing
  mentioned above" with zero file overlap.
- Timeline lives ONLY in Track A files at `/timeline`. It reads core
  hackathon rows + Track A tables. It links OUT to `/workspace/[id]` for
  Track B detail. It never queries Track B tables directly for writes.

---

## 2. Existing-file ownership (exhaustive — no overlaps)

### 2a. SHRIHARI-ONLY (Kavyadeep must never touch)

- `src/app/page.tsx`
- `src/app/hackathons/page.tsx`
- `src/app/hackathons/new/page.tsx`
- `src/app/hackathons/[id]/page.tsx`
- `src/components/hackathon/hackathon-card.tsx`
- `src/components/hackathon/hackathon-form.tsx`
- `src/components/hackathon/status-badge.tsx`
- `src/components/hackathon/stats-strip.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/bottom-nav.tsx`
- `src/lib/store.ts`
- `src/lib/seed.ts`
- `src/lib/constants.ts`
- `src/lib/types.ts` — ADDITIVE-ONLY (may append optional fields /
  new exported types; must never rename, remove, or change existing fields)
- `src/db/schema.ts` — ADDITIVE-ONLY (may append new columns/tables with
  defaults; must never alter/remove existing columns or enums in place —
  new enums only)
- `docs/data-model.md` — may append Track A section only
- `docs/architecture.md` — may append Track A section only

### 2b. KAVYADEEP-ONLY among existing files

- NONE — intentional. Kavyadeep builds 100% greenfield (see §3b). He must
  not edit ANY existing file. This is what guarantees zero overlap.

### 2c. FROZEN — neither person may touch

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/favicon.ico`
- `src/components/ui/*` (all 7: `button.tsx`, `card.tsx`, `badge.tsx`,
  `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`)
- `src/components/ui/*` — reuse read-only; if a variant is needed, copy it
  into your own component dir under your own name (e.g. Track B makes its
  own `idea-checkbox.tsx` instead of editing `ui/`).
- `src/lib/utils.ts`
- `src/db/client.ts`
- `drizzle.config.ts`, `components.json`, `next.config.ts`,
  `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `package.json`,
  `package-lock.json`, `.gitignore`, `README.md`, `AGENTS.md`, `CLAUDE.md`
- `docs/README.md`, `docs/cli-tooling.md`, `docs/neon.md`, `docs/vercel.md`,
  `docs/github.md`, `docs/pwa-roadmap.md`
- `public/*`, `.agents/*`
- `docs/work_divison_for_team.md` (this file — amend only by mutual agreement)

> Dependency / config changes (new npm package, env var, drizzle migration
> command, Next.js config): NEITHER person edits directly. Open an issue;
> maintainer applies it. Exception: `npx drizzle-kit generate` output in
> `drizzle/` may be committed by Shrihari only (he owns schema appends).
> Kavyadeep's tables ship in his own schema file and Shrihari runs the
> generate step on request — Kavyadeep never touches `drizzle/` or
> `src/db/schema.ts`.

---

## 3. New files/folders — who creates what (exclusive)

### 3a. Shrihari creates ONLY these (Kavyadeep must never create/edit them)

Routes + API (new):

- `src/app/teams/page.tsx` (team list)
- `src/app/teams/new/page.tsx` (create team)
- `src/app/teams/[teamId]/page.tsx` (team detail, members, invite code)
- `src/app/timeline/page.tsx` (post-hackathon accumulation chart)
- `src/app/api/teams/route.ts` (create/list teams)
- `src/app/api/teams/[teamId]/members/route.ts` (add/change-role/remove)
- `src/app/api/teams/[teamId]/invite/route.ts` (issue/rotate invite code)
- `src/app/api/registration/route.ts` (payment checkbox state + delete guard)

Components (new dirs, Shrihari-only):

- `src/components/teams/team-card.tsx`
- `src/components/teams/team-form.tsx`
- `src/components/teams/member-list.tsx`
- `src/components/teams/invite-dialog.tsx`
- `src/components/lifecycle/delete-hackathon-dialog.tsx`
- `src/components/lifecycle/payment-gate.tsx`
- `src/components/lifecycle/registration-checklist.tsx`
- `src/components/timeline/timeline-chart.tsx`
- `src/components/timeline/timeline-entry.tsx`
- `src/components/access/role-guard.tsx`
- `src/components/access/role-badge.tsx`

Lib (new dirs, Shrihari-only):

- `src/lib/teams/types.ts`
- `src/lib/teams/actions.ts`
- `src/lib/teams/invites.ts`
- `src/lib/access/roles.ts`
- `src/lib/access/permissions.ts`
- `src/lib/access/guards.ts`
- `src/lib/registration/payment.ts`
- `src/lib/timeline/queries.ts`

DB + docs (Shrihari-only):

- `src/db/teams-schema.ts` (tables: `teams`, `team_members`, `team_invites`,
  `access_audit`; all keyed with own ids + `hackathonId text` loose ref —
  no FK edit to core `hackathons` table)
- `docs/teams-access.md` (roles matrix, invite flow, timeline semantics)
- `scripts/check-boundaries.mjs` (optional boundary checker — ONLY Shrihari
  may create/edit this script; Kavyadeep may run it read-only)

### 3b. Kavyadeep creates ONLY these (Shrihari must never create/edit them)

Routes + API (new, all under `workspace` + `api/ai|techstack|reminders`):

- `src/app/workspace/[hackathonId]/page.tsx` (workspace shell + tabs)
- `src/app/workspace/[hackathonId]/ideate/page.tsx`
- `src/app/workspace/[hackathonId]/resources/page.tsx`
- `src/app/workspace/[hackathonId]/submissions/page.tsx`
- `src/app/workspace/[hackathonId]/outcomes/page.tsx`
- `src/app/api/ai/parse/route.ts` (paste-text / paste-URL → draft JSON)
- `src/app/api/techstack/detect/route.ts` (github URL → stack list)
- `src/app/api/reminders/route.ts` (upcoming-deadline feed)

Components (new dirs, Kavyadeep-only):

- `src/components/workspace/workspace-shell.tsx`
- `src/components/workspace/workspace-tabs.tsx`
- `src/components/ideation/chat-window.tsx`
- `src/components/ideation/idea-line.tsx`
- `src/components/ideation/idea-checkbox.tsx`
- `src/components/ideation/idea-group.tsx` (Implemented / Dropped grouping)
- `src/components/intelligence/paste-ingest-dialog.tsx`
- `src/components/intelligence/url-ingest-form.tsx`
- `src/components/reminders/deadline-form.tsx`
- `src/components/reminders/deadline-list.tsx`
- `src/components/reminders/reminder-banner.tsx`
- `src/components/resources/problem-statement-card.tsx`
- `src/components/resources/problem-statement-form.tsx`
- `src/components/resources/resource-list.tsx`
- `src/components/resources/resource-form.tsx`
- `src/components/submissions/video-link-input.tsx`
- `src/components/submissions/ppt-link-input.tsx`
- `src/components/submissions/github-link-input.tsx`
- `src/components/submissions/tech-stack-badges.tsx`
- `src/components/outcomes/result-form.tsx`
- `src/components/outcomes/prize-input.tsx`
- `src/components/outcomes/notes-editor.tsx`
- `src/components/outcomes/submission-checklist.tsx`

Lib (new dirs, Kavyadeep-only):

- `src/lib/ai/parse-text.ts`
- `src/lib/ai/parse-url.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/draft-types.ts`
- `src/lib/deadlines/types.ts`
- `src/lib/deadlines/reminders.ts`
- `src/lib/deadlines/ics-export.ts`
- `src/lib/techstack/detect.ts`
- `src/lib/techstack/mapping.ts`
- `src/lib/workspace/queries.ts`
- `src/lib/outcomes/types.ts`

DB + docs (Kavyadeep-only):

- `src/db/workspace-schema.ts` (tables: `ideas`, `deadlines`,
  `problem_statements`, `resources`, `submissions`, `outcomes`; each with
  `hackathonId text` loose ref — no edit to core `hackathons` table)
- `docs/workspace-ai.md` (workspace IA, AI ingest contract, reminder +
  tech-detect semantics)

### 3c. Explicitly forbidden creations

- Shrihari must NEVER create anything under `src/app/workspace/**`,
  `src/app/api/ai/**`, `src/app/api/techstack/**`, `src/app/api/reminders/**`,
  `src/components/workspace/**`, `src/components/ideation/**`,
  `src/components/intelligence/**`, `src/components/reminders/**`,
  `src/components/resources/**`, `src/components/submissions/**`,
  `src/components/outcomes/**`, `src/lib/ai/**`, `src/lib/deadlines/**`,
  `src/lib/techstack/**`, `src/lib/workspace/**`, `src/lib/outcomes/**`,
  `src/db/workspace-schema.ts`, `docs/workspace-ai.md`.
- Kavyadeep must NEVER create anything under `src/app/teams/**`,
  `src/app/timeline/**`, `src/app/api/teams/**`, `src/app/api/registration/**`,
  `src/components/teams/**`, `src/components/lifecycle/**`,
  `src/components/timeline/**`, `src/components/access/**`,
  `src/lib/teams/**`, `src/lib/access/**`, `src/lib/registration/**`,
  `src/lib/timeline/**`, `src/db/teams-schema.ts`, `docs/teams-access.md`,
  `scripts/check-boundaries.mjs`.
- Neither may create `src/components/ui/*`, `src/components/hackathon/*`
  (Shrihari edits existing ones; no new files there without maintainer
  approval), `src/components/shared/*`, or any new top-level `src/lib/*`
  file (all new lib code goes in the owned subdirs above).

---

## 4. Integration contracts (no file sharing needed)

- **C1 — Navigation into workspace:** Shrihari adds (in his own
  `[id]/page.tsx`) a link `<a href={/workspace/[id]}>` gated on payment.
  Kavyadeep never edits that file. Kavyadeep's shell links back with plain
  `<a href="/hackathons/[id]">` and `<a href="/timeline">`.
- **C2 — Data join key:** `hackathonId: string` (the existing `Hackathon.id`).
  Both tracks store it as plain text. No Drizzle relation edits to the core
  table; each side-table is independent so migrations never collide.
- **C3 — No shared components:** both import ONLY from `src/components/ui/*`
  (frozen, read-only) and their own dirs. Same-named needs (e.g. link input)
  are implemented twice — once per track — rather than sharing a file.
- **C4 — No shared lib writes:** Track A never imports from
  `src/lib/ai|deadlines|techstack|workspace|outcomes/*`; Track B never
  imports from `src/lib/teams|access|registration|timeline/*` for writes.
  Read-only date formatting via each track's own helper (duplicate if needed).
- **C5 — AI ingest handoff:** `POST /api/ai/parse` returns draft JSON shaped
  like `NewHackathon` + extras. Track A is NOT required to consume it —
  Kavyadeep's own `paste-ingest-dialog` writes via his own action into his
  own tables and offers "copy into create form" via clipboard/query-param,
  never by editing Track A's form component logic beyond what Shrihari
  exposes.

---

## 5. Verification per person (run before PR)

- Shrihari: `npm run lint; npm run build` + manual: create team → invite →
  role guard blocks non-member → payment gate reveals → delete blocked after
  payment → `/timeline` accumulates.
- Kavyadeep: `npm run lint; npm run build` + manual: paste text/URL → draft →
  deadlines + reminders fire → ideation checkboxes group → github → stack
  badges → video/ppt/problem/resources save → result + prize + notes persist
  → `.ics` downloads.
- Boundary check (Shrihari's script, both run it):
  `node scripts/check-boundaries.mjs` once created; until then manual
  `git diff --name-only` review against §2–§3.

---

## 6. Conflict resolution

1. File collision = last writer reverts; owner re-implements from an issue.
2. Need a FROZEN change (e.g. new shadcn primitive, nav item, env var)?
   File an issue with path + diff; maintainer applies. Do not self-merge.
3. New feature not listed here? Assign by area: pre-event / teams / roles /
   registration / timeline → Shrihari. Workspace / AI / deadlines /
   tech-detect / media / notes / results → Kavyadeep. Append it to §1 with
   date + owner before coding.
