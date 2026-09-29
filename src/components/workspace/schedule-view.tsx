"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReminderBanner } from "@/components/reminders/reminder-banner";
import { DeadlineForm } from "@/components/reminders/deadline-form";
import { useDeadlines } from "@/lib/deadlines/storage";
import { DEADLINE_TYPE_OPTIONS } from "@/lib/deadlines/types";
import type { DeadlineType } from "@/lib/deadlines/types";
import { getOverdue, getDueSoon } from "@/lib/deadlines/reminders";
import { buildIcs, downloadIcs } from "@/lib/deadlines/ics-export";
import { CalendarWeek } from "./calendar-week";
import { ScheduleList } from "./schedule-list";
import { DeadlineDetail } from "./deadline-detail";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "list";

interface ScheduleViewProps {
  hackathonId: string;
  defaultView?: ViewMode;
  /** Deep-link focus: preselect this deadline when present. */
  focusId?: string | null;
}

/**
 * B15/B16 — schedule experience: toolbar (search, type filter, view
 * switcher, export), stats strip, calendar/list content, detail panel,
 * add form. Shared by schedule/, schedule/calendar, schedule/list.
 */
export function ScheduleView({
  hackathonId,
  defaultView = "list",
  focusId = null,
}: ScheduleViewProps) {
  const { deadlines, hydrated, add, update, remove } = useDeadlines(hackathonId);
  const [view, setView] = useState<ViewMode>(defaultView);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DeadlineType>("all");
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(focusId);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deadlines.filter((d) => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (
        q &&
        !`${d.title} ${d.notes ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [deadlines, query, typeFilter]);

  const overdue = useMemo(() => getOverdue(deadlines), [deadlines]);
  const dueSoon = useMemo(() => getDueSoon(deadlines), [deadlines]);
  const selected = deadlines.find((d) => d.id === selectedId) ?? null;

  function handleExport() {
    if (filtered.length === 0) return;
    downloadIcs(`${hackathonId}-deadlines`, buildIcs(filtered));
  }

  return (
    <div className="space-y-4">
      <ReminderBanner deadlines={deadlines} />

      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              aria-label="Search deadlines"
              placeholder="Search meetings"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | DeadlineType)
              }
              options={[
                { value: "all", label: "Filter" },
                ...DEADLINE_TYPE_OPTIONS,
              ]}
              className="min-h-[44px]"
            />
            <Button
              variant="outline"
              className="min-h-[44px]"
              disabled={filtered.length === 0}
              onClick={handleExport}
            >
              Export meetings
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="View switcher"
            className="flex rounded-md border p-0.5"
          >
            {(["calendar", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded px-4 text-sm font-medium capitalize",
                  view === v
                    ? "bg-[#006BFF]/10 text-[#006BFF]"
                    : "text-muted-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            className="min-h-[44px]"
            onClick={() => setShowForm((s) => !s)}
            aria-expanded={showForm}
          >
            {showForm ? "Close" : "New deadline"}
          </Button>
        </div>
        {showForm ? (
          <div className="mt-3 border-t pt-3">
            <DeadlineForm
              onSubmit={(input) => {
                add(input);
                setShowForm(false);
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "All deadlines", count: deadlines.length },
          { label: "Due soon", count: dueSoon.length },
          { label: "Overdue", count: overdue.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-card p-3 text-center"
          >
            <p className="text-xl font-bold">{hydrated ? s.count : "–"}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : view === "calendar" ? (
        <CalendarWeek
          deadlines={filtered}
          selectedDayIso={dayFilter}
          onSelectDay={setDayFilter}
          selectedId={selectedId}
          onSelectDeadline={(id) => setSelectedId(id)}
        />
      ) : null}

      {hydrated && (view === "list" || (view === "calendar" && dayFilter)) ? (
        <div
          className={
            selected && view === "list"
              ? "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]"
              : "space-y-4"
          }
        >
          <ScheduleList
            deadlines={filtered}
            selectedId={selectedId}
            onSelect={(id) =>
              setSelectedId((s) => (s === id ? s : id))
            }
            dayFilter={view === "calendar" ? dayFilter : null}
          />
          {selected && view === "list" ? (
            <DeadlineDetail
              deadline={selected}
              hackathonId={hackathonId}
              onSave={(id, patch) => update(id, patch)}
              onDelete={(id) => {
                remove(id);
                setSelectedId(null);
              }}
              onClose={() => setSelectedId(null)}
            />
          ) : null}
        </div>
      ) : null}

      {hydrated && view === "calendar" && selected && !dayFilter ? (
        <DeadlineDetail
          deadline={selected}
          hackathonId={hackathonId}
          onSave={(id, patch) => update(id, patch)}
          onDelete={(id) => {
            remove(id);
            setSelectedId(null);
          }}
          onClose={() => setSelectedId(null)}
        />
      ) : null}

      {hydrated && filtered.length === 0 && deadlines.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          No matches.{" "}
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center text-[#006BFF] underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setDayFilter(null);
            }}
          >
            Clear search and filters
          </button>
        </p>
      ) : null}

      {hydrated ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{filtered.length}</Badge> deadline
          {filtered.length === 1 ? "" : "s"} shown
        </p>
      ) : null}
    </div>
  );
}
