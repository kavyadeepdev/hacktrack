"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Deadline } from "@/lib/deadlines/types";
import {
  DEADLINE_TYPE_LABELS,
} from "@/lib/deadlines/types";
import {
  describeDaysUntil,
  daysUntilDue,
  formatDueDate,
} from "@/lib/deadlines/reminders";
import {
  TYPE_ACCENT,
  dayKey,
  groupByDay,
  groupLabel,
} from "@/lib/workspace/schedule";

const PAGE_SIZE = 10;

interface ScheduleListProps {
  deadlines: Deadline[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Optional day filter from the calendar (`yyyy-mm-dd`). */
  dayFilter?: string | null;
}

/**
 * B16 — grouped list view (Image 2 center). Day group headers with Today
 * pill, accent-bar cards, selected ring, View-more pagination.
 */
export function ScheduleList({
  deadlines,
  selectedId,
  onSelect,
  dayFilter,
}: ScheduleListProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const todayIso = useMemo(() => dayKey(new Date().toISOString()), []);

  const groups = useMemo(() => {
    const filtered = dayFilter
      ? deadlines.filter((d) => dayKey(d.dueDate) === dayFilter)
      : deadlines;
    return groupByDay(filtered);
  }, [deadlines, dayFilter]);

  const flatCount = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = useMemo(() => {
    const flat = groups.flatMap((g) =>
      g.items.map((item) => ({ dayIso: g.dayIso, item }))
    );
    const sliced = flat.slice(0, visible);
    const regrouped = new Map<string, Deadline[]>();
    for (const entry of sliced) {
      const list = regrouped.get(entry.dayIso);
      if (list) list.push(entry.item);
      else regrouped.set(entry.dayIso, [entry.item]);
    }
    return [...regrouped.entries()].map(([dayIso, items]) => ({
      dayIso,
      items,
    }));
  }, [groups, visible]);

  if (flatCount === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm font-medium">No upcoming deadlines</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {dayFilter
            ? "Nothing falls on this day. Clear the day filter or add one."
            : "Add the first deadline — application, submission, demo day."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shown.map((group) => (
        <section key={group.dayIso} aria-label={groupLabel(group.dayIso)}>
          <div className="mb-2 flex min-h-[44px] items-center gap-2">
            <h3 className="text-base font-semibold">
              {groupLabel(group.dayIso)}
            </h3>
            {group.dayIso === todayIso ? (
              <Badge variant="secondary">Today</Badge>
            ) : null}
          </div>
          <ul className="space-y-2">
            {group.items.map((d) => {
              const days = daysUntilDue(d.dueDate);
              const active = d.id === selectedId;
              return (
                <li key={d.id}>
                  <article
                    className={cn(
                      "rounded-lg border bg-card shadow-sm",
                      active && "border-2 border-[#006BFF]"
                    )}
                    style={{ borderLeft: `4px solid ${TYPE_ACCENT[d.type]}` }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(d.id)}
                      aria-pressed={active}
                      className="block min-h-[44px] w-full p-3 text-left"
                    >
                      <span className="text-xs font-medium text-[#006BFF]">
                        {days < 0 ? "Overdue" : days === 0 ? "Up next" : DEADLINE_TYPE_LABELS[d.type]}
                      </span>
                      <span className="mt-0.5 block text-base font-semibold">
                        {d.title}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          {DEADLINE_TYPE_LABELS[d.type]} · {describeDaysUntil(days)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {formatDueDate(d.dueDate)}
                      </span>
                    </button>
                    <div className="flex gap-2 px-3 pb-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-[44px] flex-1"
                        onClick={() => onSelect(d.id)}
                      >
                        Manage
                      </Button>
                      {days >= 0 && days <= 3 ? (
                        <Button
                          size="sm"
                          className="min-h-[44px] flex-1 bg-[#0A2540] text-white hover:bg-[#0A2540]/90"
                          onClick={() => onSelect(d.id)}
                        >
                          Reschedule
                        </Button>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {flatCount > visible ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            View more meetings
          </Button>
        </div>
      ) : null}
    </div>
  );
}
