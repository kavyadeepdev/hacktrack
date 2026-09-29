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
 * B15/B16 (desktop-first) — 3-pane schedule experience like the reference
 * screens: left control rail (search, filter, export, stats), center
 * calendar/list, right sticky detail/edit panel. Stacks below `xl`.
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

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setDayFilter(null);
  }

  return (
    <div className="space-y-4">
      <ReminderBanner deadlines={deadlines} />

      <div className="flex h-[44px] items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Schedule</h2>
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
                "inline-flex h-[40px] items-center rounded px-5 text-sm font-medium capitalize",
                view === v
                  ? "bg-[#006BFF]/10 text-[#006BFF]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <Input
            aria-label="Search deadlines"
            placeholder="Search meetings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "all" | DeadlineType)
            }
            options={[
              { value: "all", label: "All Users & Teams" },
              ...DEADLINE_TYPE_OPTIONS,
            ]}
          />
          <Button
            variant="outline"
            className="h-[44px] w-full"
            disabled={filtered.length === 0}
            onClick={handleExport}
          >
            Export meetings
          </Button>
          <Button
            className="h-[44px] w-full"
            onClick={() => setShowForm((s) => !s)}
            aria-expanded={showForm}
          >
            {showForm ? "Close" : "New deadline"}
          </Button>
          {showForm ? (
            <div className="border-t pt-3">
              <DeadlineForm
                onSubmit={(input) => {
                  add(input);
                  setShowForm(false);
                }}
              />
            </div>
          ) : null}
          <div className="space-y-2 border-t pt-3">
            {[
              { label: "All deadlines", count: deadlines.length },
              { label: "Due soon", count: dueSoon.length },
              { label: "Overdue", count: overdue.length },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{s.label}</span>
                <Badge variant="secondary">{hydrated ? s.count : "–"}</Badge>
              </div>
            ))}
          </div>
          {(query || typeFilter !== "all" || dayFilter) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-[44px] items-center text-sm font-medium text-[#006BFF] underline-offset-4 hover:underline"
            >
              Clear search and filters
            </button>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {!hydrated ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : view === "calendar" ? (
            <>
              <CalendarWeek
                deadlines={filtered}
                selectedDayIso={dayFilter}
                onSelectDay={setDayFilter}
                selectedId={selectedId}
                onSelectDeadline={(id) => setSelectedId(id)}
              />
              {dayFilter ? (
                <ScheduleList
                  deadlines={filtered}
                  selectedId={selectedId}
                  onSelect={(id) =>
                    setSelectedId((s) => (s === id ? s : id))
                  }
                  dayFilter={dayFilter}
                />
              ) : null}
            </>
          ) : (
            <ScheduleList
              deadlines={filtered}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId((s) => (s === id ? s : id))}
            />
          )}

          {hydrated && filtered.length === 0 && deadlines.length > 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium">No matches</p>
              <button
                type="button"
                className="mt-1 inline-flex h-[44px] items-center text-sm text-[#006BFF] underline-offset-4 hover:underline"
                onClick={clearFilters}
              >
                Clear search and filters
              </button>
            </div>
          ) : null}
        </div>

        <div className="xl:sticky xl:top-6">
          {selected ? (
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
          ) : (
            <div className="hidden rounded-lg border border-dashed p-6 text-center xl:block">
              <p className="text-sm font-medium">No deadline selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a day or a card to see details, reschedule, or edit.
              </p>
            </div>
          )}
        </div>
      </div>

      {hydrated ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{filtered.length}</Badge> deadline
          {filtered.length === 1 ? "" : "s"} shown
        </p>
      ) : null}
    </div>
  );
}
