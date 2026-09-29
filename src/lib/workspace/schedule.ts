/**
 * Workspace schedule helpers (Track B — B15/B16).
 * Pure + server-safe: day math, grouping, type accents. No window access.
 */
import type { Deadline, DeadlineType } from "@/lib/deadlines/types";

/** Accent bar color per deadline type (Calendly-style left rail). */
export const TYPE_ACCENT: Record<DeadlineType, string> = {
  application: "#2FA36B",
  registration: "#006BFF",
  submission: "#7C5CFF",
  demo: "#E09A00",
  other: "#9AA3B2",
};

export const HOUR_START = 8;
export const HOUR_END = 18;
export const HOUR_PX = 56;
export const MAX_WEEK_OFFSET = 26;

/** Local `yyyy-mm-dd` key for a datetime (avoids UTC-shift grouping bugs). */
export function dayKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "invalid";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Sunday (local) starting the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** `Thu 30 Jul`-style group label. */
export function groupLabel(dayIso: string): string {
  const d = new Date(`${dayIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dayIso;
  const wd = d.toLocaleDateString(undefined, { weekday: "short" });
  const rest = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  return `${wd} ${rest}`;
}

/** `July 2026`-style week header from a week-start date. */
export function weekLabel(weekStart: Date): string {
  return weekStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export interface DayGroup {
  dayIso: string;
  items: Deadline[];
}

/** Group deadlines by local day, sorted ascending (day, then time). */
export function groupByDay(deadlines: Deadline[]): DayGroup[] {
  const map = new Map<string, Deadline[]>();
  for (const d of deadlines) {
    const key = dayKey(d.dueDate);
    const list = map.get(key);
    if (list) list.push(d);
    else map.set(key, [d]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([dayIso, items]) => ({
      dayIso,
      items: [...items].sort((x, y) =>
        x.dueDate < y.dueDate ? -1 : x.dueDate > y.dueDate ? 1 : 0
      ),
    }));
}

/** Minutes since midnight (local) for block positioning. NaN-safe. */
export function minutesOfDay(value: string): number {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return HOUR_START * 60;
  return d.getHours() * 60 + d.getMinutes();
}

export function timeLabel(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
