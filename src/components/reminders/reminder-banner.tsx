"use client";

import { Badge } from "@/components/ui/badge";
import type { Deadline } from "@/lib/deadlines/types";
import {
  DUE_SOON_WINDOW_DAYS,
  describeDaysUntil,
  getReminderStates,
} from "@/lib/deadlines/reminders";

interface ReminderBannerProps {
  deadlines: Deadline[];
  /** Days ahead that counts as "due soon". Defaults to 3. */
  windowDays?: number;
  /** ISO timestamp override (tests / stories). Defaults to now. */
  nowIso?: string;
}

/**
 * B2 — due-soon / overdue strip. Renders nothing when every deadline
 * is further out than `windowDays`. Pure + props-driven so both the
 * workspace overview and the ideate page can reuse it.
 */
export function ReminderBanner({
  deadlines,
  windowDays = DUE_SOON_WINDOW_DAYS,
  nowIso,
}: ReminderBannerProps) {
  const now = nowIso ? new Date(nowIso) : new Date();
  const flagged = getReminderStates(deadlines, now, windowDays).filter(
    (r) => r.state !== "upcoming"
  );
  if (flagged.length === 0) return null;

  const overdue = flagged.filter((r) => r.state === "overdue");
  const dueSoon = flagged.filter((r) => r.state === "due-soon");

  return (
    <div
      role="alert"
      aria-live="polite"
      className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
    >
      {overdue.length > 0 && (
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
            Overdue
            <Badge variant="destructive">{overdue.length}</Badge>
          </p>
          <ul className="space-y-1">
            {overdue.map(({ deadline, daysUntil }) => (
              <li key={deadline.id} className="text-sm">
                <span className="font-medium">{deadline.title}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {describeDaysUntil(daysUntil)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            Due soon
            <Badge variant="secondary">{dueSoon.length}</Badge>
          </p>
          <ul className="space-y-1">
            {dueSoon.map(({ deadline, daysUntil }) => (
              <li key={deadline.id} className="text-sm">
                <span className="font-medium">{deadline.title}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {describeDaysUntil(daysUntil)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
