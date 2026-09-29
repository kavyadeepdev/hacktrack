"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Deadline } from "@/lib/deadlines/types";
import {
  HOUR_END,
  HOUR_PX,
  HOUR_START,
  MAX_WEEK_OFFSET,
  TYPE_ACCENT,
  WEEKDAY_LABELS,
  addDays,
  addWeeks,
  dayKey,
  minutesOfDay,
  startOfWeek,
  timeLabel,
  weekLabel,
} from "@/lib/workspace/schedule";

interface CalendarWeekProps {
  deadlines: Deadline[];
  /** Local `yyyy-mm-dd` of the selected day, or null. */
  selectedDayIso: string | null;
  onSelectDay: (dayIso: string | null) => void;
  selectedId?: string | null;
  onSelectDeadline?: (id: string) => void;
}

const GRID_HEIGHT = (HOUR_END - HOUR_START) * HOUR_PX;

function blockTop(dueDate: string): number {
  const mins = Math.min(
    Math.max(minutesOfDay(dueDate), HOUR_START * 60),
    HOUR_END * 60 - 30
  );
  return ((mins - HOUR_START * 60) / 60) * HOUR_PX;
}

/**
 * B16 — week-grid calendar (Image 1). 7-day grid, 08:00–18:00 rows,
 * week nav clamped to ±26 weeks, day select + deadline select.
 */
export function CalendarWeek({
  deadlines,
  selectedDayIso,
  onSelectDay,
  selectedId,
  onSelectDeadline,
}: CalendarWeekProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const todayIso = useMemo(() => dayKey(new Date().toISOString()), []);

  const weekStart = useMemo(
    () => addWeeks(startOfWeek(new Date()), weekOffset),
    [weekOffset]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    []
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of deadlines) {
      const key = dayKey(d.dueDate);
      const list = map.get(key);
      if (list) list.push(d);
      else map.set(key, [d]);
    }
    return map;
  }, [deadlines]);

  function dayIso(date: Date): string {
    return dayKey(date.toISOString());
  }

  return (
    <section aria-label="Schedule calendar" className="space-y-3">
      <div className="flex min-h-[44px] items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            aria-label="Previous week"
            disabled={weekOffset <= -MAX_WEEK_OFFSET}
            onClick={() => setWeekOffset((w) => Math.max(w - 1, -MAX_WEEK_OFFSET))}
          >
            ‹
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            aria-label="Next week"
            disabled={weekOffset >= MAX_WEEK_OFFSET}
            onClick={() => setWeekOffset((w) => Math.min(w + 1, MAX_WEEK_OFFSET))}
          >
            ›
          </Button>
          <h3 className="text-base font-semibold">{weekLabel(weekStart)}</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedDayIso ? (
            <Button
              variant="link"
              size="sm"
              className="min-h-[44px] text-[#006BFF]"
              onClick={() => onSelectDay(null)}
            >
              Clear filters
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(0)}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b bg-muted/40">
            <div />
            {days.map((date, i) => {
              const iso = dayIso(date);
              const isToday = iso === todayIso;
              const isSelected = iso === selectedDayIso;
              const count = byDay.get(iso)?.length ?? 0;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${count} deadline${count === 1 ? "" : "s"}`}
                  onClick={() => onSelectDay(isSelected ? null : iso)}
                  className={cn(
                    "flex min-h-[44px] flex-col items-center justify-center gap-0.5 py-1.5",
                    isSelected && "bg-[#006BFF]/10"
                  )}
                >
                  <span className="text-xs uppercase text-muted-foreground">
                    {WEEKDAY_LABELS[i]}
                  </span>
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-[#006BFF]/10 font-semibold text-[#006BFF]"
                        : "font-medium"
                    )}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            <div className="relative" style={{ height: GRID_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t text-xs text-muted-foreground"
                  style={{ top: (h - HOUR_START) * HOUR_PX }}
                >
                  <span className="absolute -top-2 right-1 bg-background pr-1">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>
            {days.map((date) => {
              const iso = dayIso(date);
              const items = (byDay.get(iso) ?? []).slice().sort((a, b) =>
                a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
              );
              const isSelected = iso === selectedDayIso;
              return (
                <div
                  key={iso}
                  className={cn(
                    "relative border-l",
                    isSelected && "bg-[#006BFF]/5"
                  )}
                  style={{ height: GRID_HEIGHT }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute inset-x-0 border-t border-border/60"
                      style={{ top: (h - HOUR_START) * HOUR_PX }}
                    />
                  ))}
                  {items.map((d) => {
                    const top = blockTop(d.dueDate);
                    const active = d.id === selectedId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => onSelectDeadline?.(d.id)}
                        aria-pressed={active}
                        aria-label={`${d.title}, ${timeLabel(d.dueDate)}`}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded border bg-card p-1 text-left shadow-sm hover:bg-muted/60",
                          active ? "border-2 border-[#006BFF]" : "border-border"
                        )}
                        style={{
                          top,
                          height: Math.max(40, HOUR_PX / 2 - 4),
                          borderLeft: `4px solid ${TYPE_ACCENT[d.type]}`,
                        }}
                      >
                        <span className="block truncate text-xs font-semibold">
                          {d.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {timeLabel(d.dueDate)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
