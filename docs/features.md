# Features — HackTrack

What to build, who builds it, and how. Task split lives in **Linear**
(team `PAY`, project `HackTrack`) — each item below links its issue.
Work division rules (file ownership, hard no-touch rule) live in
`docs/linear.md`. Flow for adding new features: `docs/linear.md#adding-a-new-set-of-features`.

Tick the box in the SAME PR that finishes the feature (required by `AGENTS.md`).

## Track A — Shrihari (`track-a`, branch `person/shrihari`)

Lifecycle, registration gate, teams + RBAC, timeline. Owns the existing
tracker UI (`src/app/hackathons/**`, `src/components/hackathon/*`,
`src/components/layout/*`) plus everything under `src/app/teams/**`,
`src/app/timeline/**`, `src/app/api/teams/**`,
`src/app/api/registration/**`, `src/components/teams|lifecycle|timeline|access/**`,
`src/lib/teams|access|registration|timeline/**`, `src/db/teams-schema.ts`.

- [x] **A1 — Add / edit / list hackathons (PAY-6).** Extend the existing
  tracker list (`src/app/hackathons/page.tsx`), create form
  (`src/app/hackathons/new/page.tsx`) and detail page
  (`src/app/hackathons/[id]/page.tsx`) with name, organizer, location,
  remote flag, start/end dates and event URL. Persist via
  `useHackathons()` (`src/lib/store.ts`) using the `Hackathon` shape in
  `src/lib/types.ts`.
- [x] **A2 — Core event links on the tracker form (PAY-7).** Add event URL
  + registration URL fields to `hackathon-form.tsx` with URL validation,
  rendered as tappable links on the card and detail page.
- [x] **A3 — Team formation, creation, invites (PAY-8).** New routes
  `src/app/teams/` (list, new, `[teamId]` detail) + `team-card.tsx`,
  `team-form.tsx`, `member-list.tsx`, `invite-dialog.tsx`. Tables
  `teams`, `team_members` in `src/db/teams-schema.ts`, keyed by own ids
  plus a loose `hackathonId: string` (never edit the core `hackathons` table).
- [x] **A4 — Role-based access (PAY-9).** Roles (owner / member / viewer)
  in `src/lib/access/roles.ts`, permission checks in
  `permissions.ts`/`guards.ts`, `role-guard.tsx` wrapper for protected UI,
  `role-badge.tsx` for display, member add/change-role/remove API in
  `src/app/api/teams/[teamId]/members/route.ts`.
- [x] **A5 — Payment-checkbox gate (PAY-10).** A `paymentConfirmed`
  boolean per hackathon (`src/lib/registration/payment.ts`,
  `src/app/api/registration/route.ts`). Unchecked = minimal pre-hackathon
  view; checked = reveals the full fieldset AND a deep link to
  `/workspace/[hackathonId]` (Track B fields live only behind that link,
  never inlined here).
- [x] **A6 — Delete hackathon, pre-event only (PAY-11).**
  `delete-hackathon-dialog.tsx` with confirm step; deletion blocked once
  payment is confirmed or the event is over (guard in the registration API).
- [x] **A7 — Post-hackathon timeline chart (PAY-12).** New `/timeline`
  route rendering `timeline-chart.tsx` + `timeline-entry.tsx` from
  `src/lib/timeline/queries.ts`: chronological accumulation of attended
  hackathons with details intact, linking out to `/workspace/[id]`.
- [x] **A8 — Dashboard list + detail shell (PAY-13).** `src/app/page.tsx`
  stats/up-next/recent; `[id]` page hosts status/result editing and the
  workspace entry link (Contract: Kavyadeep never edits these files).
- [x] **A9 — Invite codes with expiry + access audit (PAY-14, `added`).**
  `src/app/api/teams/[teamId]/invite/route.ts` issues/rotates codes,
  `src/lib/teams/invites.ts` validates + expires them,
  `team_invites` + `access_audit` tables record joins and role changes.
- [ ] **A10 — Global desktop app shell (PAY-32).** Calendly-style left
  sidebar + full-width content frame app-wide (Track B already ships the
  workspace-local 3-pane shell). Owned files: `src/app/layout.tsx`,
  `src/components/layout/*`. Owner: Shrihari, branch `person/shrihari`.

## Track B — Kavyadeep (`track-b`, branch `person/kavyadeep`)

Build workspace, intelligence, reminders, outcomes. 100% greenfield under
`/workspace/[hackathonId]` — never touches `src/app/hackathons/**` or any
existing file. Owns `src/app/workspace/**`,
`src/app/api/ai|techstack|reminders/**`,
`src/components/workspace|ideation|intelligence|reminders|resources|submissions|outcomes/**`,
`src/lib/ai|deadlines|techstack|workspace|outcomes/**`,
`src/db/workspace-schema.ts` (tables `ideas`, `deadlines`,
`problem_statements`, `resources`, `submissions`, `outcomes`, each with
loose `hackathonId: string`).

- [x] **B1 — Deadlines, multiple per hackathon (PAY-15).**
  `deadline-form.tsx` + `deadline-list.tsx` backed by the `deadlines`
  table (`hackathonId`, title, due date, type); CRUD inside the workspace
  Resources/Overview tab.
- [x] **B2 — Reminders before deadlines (PAY-16).**
  `reminder-banner.tsx` (due-soon/overdue strip computed in
  `src/lib/deadlines/reminders.ts`) + `src/app/api/reminders/route.ts`
  upcoming-deadline feed.
- [x] **B3 — Ideation chat with checkboxes (PAY-17).** `chat-window.tsx`
  with multiple `idea-line.tsx` rows (ideate + feature suggestions), each
  with `idea-checkbox.tsx`; `idea-group.tsx` groups rows into Implemented
  / Dropped. Stored in the `ideas` table with a status enum.
- [x] **B4 — Video link upload (PAY-18).** `video-link-input.tsx` saving
  the demo video URL to the `submissions` row; render an embedded player
  when the host allows it.
- [x] **B5 — PPT link upload (PAY-19).** `ppt-link-input.tsx`, same
  `submissions` row pattern as B4.
- [x] **B6 — Problem statements (PAY-20).**
  `problem-statement-card.tsx` + `problem-statement-form.tsx` on the
  `problem_statements` table (title, body, source URL).
- [x] **B7 — Resources link library (PAY-21).** `resource-list.tsx` +
  `resource-form.tsx` (docs, APIs, datasets) with title/URL/tag, filterable
  by tag.
- [x] **B8 — GitHub link upload (PAY-22).** `github-link-input.tsx`
  with repo-URL validation, saved to the `submissions` row; feeds B9.
- [x] **B9 — Tech-stack detection from GitHub (PAY-23).**
  `src/app/api/techstack/detect/route.ts` fetches the repo's language
  breakdown (GitHub REST, no token for public repos) and maps it via
  `src/lib/techstack/mapping.ts`; display in `tech-stack-badges.tsx`.
- [x] **B10 — Result win/lose + prize money (PAY-24).**
  `result-form.tsx` + `prize-input.tsx` writing the `outcomes` row
  (result enum, prize text/amount).
- [x] **B11 — Personalized notes (PAY-25).** `notes-editor.tsx` for
  ongoing notes + retrospective learnings (what learnt, what worked) on the
  `outcomes` row.
- [x] **B12 — LLM parse: paste text/URL to draft (PAY-26).**
  `paste-ingest-dialog.tsx` + `url-ingest-form.tsx` POST to
  `src/app/api/ai/parse/route.ts` (prompt builders in `src/lib/ai/`);
  returns draft JSON shaped like `NewHackathon` + extras, offered as
  copy-into-form via clipboard/query-param (never edits Track A files).
- [x] **B13 — Submission checklist + `.ics` export (PAY-27, `added`).**
  `submission-checklist.tsx` (video/PPT/repo/result completeness) and
  `src/lib/deadlines/ics-export.ts` generating a downloadable calendar file
  for all deadlines.

## Track B — Schedule views, Calendly design language (`track-b`, branch `person/kavyadeep`)

Calendly-inspired schedule experience for deadlines: week-grid calendar
(Image 1), grouped list (Image 2), detail/edit panel + activity timeline
(Image 2 right, Image 3). Spec lives in `docs/design.md`. All greenfield
under `src/app/workspace/[hackathonId]/schedule/**` +
`src/components/workspace/**` + `src/components/reminders/calendar-*.tsx` —
never touches Track A or frozen files.

- [x] **B14 — Design language spec (docs/design.md) (PAY-28).** Calendly tokens
  (blue #006BFF / navy #0A2540, light borders, soft selected blue),
  layout patterns (left rail, center list/calendar, right detail), view
  rules (calendar week-grid, list grouped by day, detail/edit panel),
  mobile-first behavior. Owned files: `docs/design.md`.
- [x] **B15 — Workspace shell + schedule overview (PAY-29).** `layout.tsx` tab shell
  for `/workspace/[hackathonId]` (Overview / Schedule / Resources /
  Submissions / Outcomes / Ideate) + `schedule/page.tsx` overview with
  search, type filter, view switcher (calendar | list), export `.ics`.
  Owned files: `src/app/workspace/[hackathonId]/layout.tsx`,
  `src/app/workspace/[hackathonId]/page.tsx`,
  `src/app/workspace/[hackathonId]/schedule/page.tsx`,
  `src/components/workspace/*`, `src/lib/workspace/*`.
- [x] **B16 — Deadlines calendar, list + detail/edit views (PAY-30).**
  `calendar-week.tsx` (7-day grid, week nav, today, select day),
  `schedule-list.tsx` (grouped by day, selected card, join/manage CTA),
  `deadline-detail.tsx` (detail/edit panel: reschedule via
  `datetime-local`, type, notes, delete with confirm, activity timeline).
  Owned files: `src/components/reminders/calendar-*.tsx`,
  `src/app/workspace/[hackathonId]/schedule/calendar/page.tsx`,
  `src/app/workspace/[hackathonId]/schedule/list/page.tsx`,
  `src/app/workspace/[hackathonId]/schedule/[deadlineId]/page.tsx`,
  `src/components/workspace/schedule-*.tsx`.
- [x] **B17 — Remaining workspace pages in design language (PAY-31).** Resources
  (`problem statements` + link library with search/tag filter), Submissions
  (video/PPT/GitHub + tech badges + checklist), Outcomes (result/prize +
  notes), each with list + detail/edit panel reusing B16 patterns.
  Owned files: `src/app/workspace/[hackathonId]/resources/page.tsx`,
  `src/app/workspace/[hackathonId]/submissions/page.tsx`,
  `src/app/workspace/[hackathonId]/outcomes/page.tsx`.

## Cross-cutting flows (no shared files)

- **Payment reveals everything:** A5 renders Track A fields inline and links
  to `/workspace/[hackathonId]` for Track B. Back-links from the workspace
  shell use plain `<a href="/hackathons/[id]">` / `<a href="/timeline">`.
- **Timeline accumulates:** A7 reads core rows + Track A tables only.
- **Join key:** `hackathonId: string` everywhere. No FK edits to core tables.
- **Shared code:** both tracks import only from frozen `src/components/ui/*`;
  anything else is duplicated per track rather than shared.
