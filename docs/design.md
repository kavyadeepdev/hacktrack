# Design language — HackTrack schedule views (B14)

Calendly-inspired design for the Track B workspace, derived from the three
reference screens: week-grid picker (Image 1), grouped list + detail panel
(Image 2), activity timeline + details rail (Image 3).

## Tokens

- Primary blue: `#006BFF` (links, selected-card border, active tab
  underline, primary CTA text on light surfaces).
- Navy CTA: `#0A2540` (solid `Join` / `Next`-style buttons, white text).
- Danger: `#C93A3A`-ish via existing `destructive` token (`Cancel` outline).
- Surfaces: white cards (`bg-card`), page `bg-background`, subtle rail
  `bg-muted/40` for the left filter column.
- Borders: `border-border` hairlines; cards `rounded-lg` (`--radius` from
  theme, no new radius scale).
- Selected card: 2px primary-blue border (`border-[#006BFF]`), left accent
  bar 4px per-type color, white surface, `shadow-sm`.
- Type accent bars (calendar blocks + list cards): application green
  `#2FA36B`, registration blue `#006BFF`, submission violet, demo amber,
  other gray. Overdue keeps the `destructive` badge; accent bar unchanged.
- Typography: page title `text-2xl font-bold tracking-tight`; section
  `text-base font-semibold`; card title `text-sm font-semibold` or
  `text-base` for the selected detail; meta `text-sm text-muted-foreground`;
  micro labels (`SUN 19`) `text-xs uppercase text-muted-foreground`.
- No new fonts, no new shadcn primitives, no emoji. Icons: `lucide-react`
  only (`CalendarDays`, `List`, `Search`, `Download`, `Pencil`,
  `Trash2`, `X`, `ChevronLeft/Right`, `Clock`).

## Layout patterns (desktop-first)

> Override note: this spec intentionally departs from the repo-wide
> mobile-first rule for the Track B workspace — base styles target the
> desktop 3-pane frame below, with stacking fallbacks under `lg`/`xl`
> (not a 360px-first flow). The global app shell (bottom nav era) is
> out of Track B scope; see the handoff issue for Track A.

### Shell (`src/app/workspace/[hackathonId]/layout.tsx`)
- Full-width app frame `max-w-[1400px]`, `px-6 py-6`.
- Plain-`<a>` back-links (`← Back to hackathon`, `Timeline`) per the
  cross-cutting flow (no shared layout edits).
- Left section rail (`w-60`, icon + label rows like screenshots 2–3:
  Overview, Schedule, Resources, Submissions, Outcomes, Ideate), sticky,
  active row `bg-[#006BFF]/10 text-[#006BFF] rounded-lg`; collapses to the
  horizontal underline tab bar below `lg`.
- Title block lives atop the rail on desktop, above content on mobile.

### Overview (`schedule/page.tsx`)
- Header row: `Schedule` title left, Calendar | List segmented switcher
  right.
- 3-pane grid `xl:grid-cols-[260px_minmax(0,1fr)_340px]`: left control
  rail (search, type filter, Export meetings, New deadline, stat rows),
  center calendar/list, right sticky detail panel (dashed
  `No deadline selected` placeholder when empty).
- Below `xl` the panes stack: rail, center, detail.

### Calendar view (`calendar-week.tsx`, Image 1)
- Header: `< ChevronLeft > < Month Year v >`, `Today` pill, `Clear filters`
  link-button on the right when a day/type filter is active.
- Weekday header row: `SUN..SAT` micro label + day number; today gets a
  soft blue circle (`bg-[#006BFF]/10 text-[#006BFF] font-semibold`).
- Grid: 7 columns, hour rows 08:00–18:00 (configurable constant), all-day
  strip on top. Deadlines render as blocks positioned by due time;
  all-day/untimed deadlines stack in the strip. Selected block: blue
  border + white surface; hover: `bg-muted/60`.
- Below grid (mobile) / right rail (desktop `lg:` two-column): selected
  day's deadline cards in list style. Day cells are `<button>`s with
  `aria-pressed` and `aria-label="Jul 24, 3 deadlines"`.
- Week nav clamps to ±26 weeks from today; `Today` resets.

### List view (`schedule-list.tsx`, Image 2 center)
- Group headers: `Thu 30 Jul` + `Today` pill when applicable.
- Cards: left 4px type-accent bar, title (`font-semibold`), meta line
  (`hosted`-style secondary text: `{Type} · {time} · {daysUntil}`), time
  row, CTA row (`Manage` outline + `Reschedule` navy when due-soon).
- Selected card: 2px primary-blue ring; clicking sets `selectedId` and
  opens the detail panel (side rail on `lg:`, stacked section below on
  mobile).
- `View more` outline button paginates (page size 10) when > 10 items.
- Empty state: dashed-border card (`No upcoming deadlines`).

### Detail / edit view (`deadline-detail.tsx`, Images 2 right + 3)
- Header: `Up next` micro label (primary blue) when the item is the
  nearest upcoming, title, date/time lines, `Reschedule` (navy) +
  `Cancel deadline` (danger outline) buttons, close `X` on mobile sheet.
- Tabs: `Details | Notes` underline tabs (local state, no routing).
- Details tab: editable form (title `Input`, due `datetime-local`,
  type `Select`, notes `Textarea`) reusing `DeadlineForm` props shape;
  Save (navy) + Delete-with-confirm (danger outline → `Confirm` /
  `Keep`); validation messages in `text-destructive`.
- Sidebar sections (stacked on mobile): `Attendees`-equivalent =
  `Reminders` (overdue/due-soon state + days-until), `Location`-equivalent
  = `Type & source` (type badge, hackathon link), `Hosts`-equivalent =
  `Activity` timeline (created/updated/notes events, Image 3 pattern:
  icon + `You {action}` + timestamp right-aligned + event card).
- All interactive elements `min-h-[44px]`; form inputs `text-base`
  on mobile (`sm:text-sm`).

## View rules (where each view applies)

- Schedule (deadlines): all three views (calendar + list + detail/edit).
- Resources (problem statements + link library): list + detail/edit
  (search + tag filter toolbar; no calendar — links have no due time).
- Submissions (video/PPT/repo + tech badges + checklist): single-column
  editor + checklist summary; detail = inline edit per link card.
- Outcomes (result/prize + notes): single form view + saved-state
  timeline entry; no calendar.
- Ideate: existing chat UI unchanged, linked from shell tabs.

## Desktop-first behavior

- Base = desktop 3-pane frame (left rail 240px, fluid center, right
  detail 340px sticky). Fallbacks, not first-class flows: below `xl`
  schedule panes stack; below `lg` the rail becomes the horizontal tab
  bar; the calendar grid scrolls horizontally (`min-w-[720px]`) on
  narrow screens.
- Touch targets ≥ 44px; focus-visible rings on all buttons/links/inputs;
  `aria-pressed` on day cells and view switcher; `role="alert"` stays on
  `ReminderBanner`.

## Data contracts (unchanged)

- `Deadline` / `NewDeadline` (`src/lib/deadlines/types.ts`), `useDeadlines`
  (`storage.ts`, localStorage `hacktrack:deadlines:v1`), pure helpers
  (`reminders.ts`: `getReminderStates`, `describeDaysUntil`,
  `formatDueDate`), `buildIcs`/`downloadIcs` (`ics-export.ts`).
- No new stores. Pages compose existing hooks; detail panel calls
  `update`/`remove` from `useDeadlines`. No `src/db/*` imports from
  client components; no Track A / frozen file edits.
