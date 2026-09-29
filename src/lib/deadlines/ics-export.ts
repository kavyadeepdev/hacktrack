/**
 * `.ics` calendar export for deadlines (Track B — PAY-27 / B13).
 * Pure + server-safe: builds an RFC 5545 VCALENDAR string. The
 * `downloadIcs()` helper is client-only (guards document/window).
 */
import type { Deadline } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a date as UTC `YYYYMMDDTHHMMSSZ`. */
export function formatIcsDate(value: string): string {
  const d = new Date(value);
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return (
    `${safe.getUTCFullYear()}${pad(safe.getUTCMonth() + 1)}${pad(safe.getUTCDate())}` +
    `T${pad(safe.getUTCHours())}${pad(safe.getUTCMinutes())}${pad(safe.getUTCSeconds())}Z`
  );
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function deadlineToVevent(d: Deadline): string {
  const stamp = formatIcsDate(new Date().toISOString());
  const due = formatIcsDate(d.dueDate);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(d.id)}@hacktrack`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${due}`,
    `SUMMARY:${escapeIcsText(`[${d.hackathonId}] ${d.title}`)}`,
  ];
  const description = [
    `Type: ${d.type}`,
    d.notes ? d.notes : null,
  ]
    .filter(Boolean)
    .join("\\n");
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildIcs(
  deadlines: Deadline[],
  calendarName = "HackTrack deadlines"
): string {
  const events = [...deadlines]
    .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate))
    .map(deadlineToVevent)
    .join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HackTrack//Deadlines//EN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
