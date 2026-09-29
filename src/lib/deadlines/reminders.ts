/**
 * Due-soon / overdue computation (Track B — PAY-15 storage scope,
 * consumed by PAY-16 `reminder-banner.tsx` + `api/reminders`).
 * Server-safe: pure date math, no window/localStorage access.
 */
import type { Deadline } from "./types";

export const DUE_SOON_WINDOW_DAYS = 3;

export type ReminderState = "overdue" | "due-soon" | "upcoming";

export interface DeadlineReminder {
  deadline: Deadline;
  state: ReminderState;
  /** Whole days until due (negative when overdue). */
  daysUntil: number;
}

function startOfDayMs(value: Date): number {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function daysUntilDue(dueDate: string, now: Date = new Date()): number {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return Number.POSITIVE_INFINITY;
  const ms = startOfDayMs(due) - startOfDayMs(now);
  return Math.round(ms / 86_400_000);
}

export function classifyDeadline(
  dueDate: string,
  now: Date = new Date(),
  windowDays: number = DUE_SOON_WINDOW_DAYS
): ReminderState {
  const days = daysUntilDue(dueDate, now);
  if (days < 0) return "overdue";
  if (days <= windowDays) return "due-soon";
  return "upcoming";
}

export function getReminderStates(
  deadlines: Deadline[],
  now: Date = new Date(),
  windowDays: number = DUE_SOON_WINDOW_DAYS
): DeadlineReminder[] {
  return deadlines
    .map((deadline) => ({
      deadline,
      state: classifyDeadline(deadline.dueDate, now, windowDays),
      daysUntil: daysUntilDue(deadline.dueDate, now),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getOverdue(
  deadlines: Deadline[],
  now: Date = new Date()
): Deadline[] {
  return deadlines.filter(
    (d) => classifyDeadline(d.dueDate, now) === "overdue"
  );
}

export function getDueSoon(
  deadlines: Deadline[],
  now: Date = new Date(),
  windowDays: number = DUE_SOON_WINDOW_DAYS
): Deadline[] {
  return deadlines.filter(
    (d) => classifyDeadline(d.dueDate, now, windowDays) === "due-soon"
  );
}

export function formatDueDate(dueDate: string): string {
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return dueDate;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function describeDaysUntil(days: number): string {
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "1 day overdue" : `${n} days overdue`;
  }
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}
