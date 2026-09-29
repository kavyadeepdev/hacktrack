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

## Layout patterns

### Shell (`src/app/workspace/[hackathonId]/layout.tsx`)
- Center column `mx-auto w-full max-w-2xl px-4 py-6`, `space-y-4/6`.
- Top: plain-`<a>` back-links (`← Back to hackathon`, `Timeline`) per the
  cross-cutting flow (no shared layout edits).
- Title block: `h1` + one-line `text-sm text-muted-foreground` description.
- Tab bar: horizontal scroll row of underline tabs (Overview / Schedule /
  Resources / Submissions / Outcomes / Ideate), active tab primary-blue
  underline + `font-semibold`; each tab `min-h-[44px]`.
- Below tabs: `ReminderBanner` (when any deadline is overdue/due-soon).

### Overview (`schedule/page.tsx`)
- Toolbar card: search input (`Search meetings` placeholder pattern),
  type-filter `Select` (All + 5 deadline types), view switcher
  (Calendar | List segmented buttons), Export `.ics` outline button.
- Stats strip: `All deadlines / Due soon / Overdue` counts as small cards.
- Content: calendar week-grid OR grouped list (client state, default list
  on mobile, calendar on `sm:`+ only if it fits — both always available
  via the switcher).

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

## Mobile-first behavior

- Base 360px: single column, toolbar stacks (search full-width, filter +
  view switcher row below), calendar grid horizontally scrollable
  (`overflow-x-auto`, min column 44px), detail panel renders as stacked
  section under the list with an `X` that clears `selectedId`.
- `sm:`: toolbar single row, two-column stats, tab bar fits without scroll.
- `lg:` (within `max-w-2xl` shell, only where space allows): list +
  detail side-by-side (`grid-cols-[1fr_320px]`); otherwise stacked.
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
