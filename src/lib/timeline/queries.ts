/**
 * Timeline queries (Track A, PAY-12). Pure selectors over `Hackathon`
 * rows: chronological accumulation of attended hackathons with details
 * intact. Reads core rows only.
 */
import type { Hackathon } from "@/lib/types";

export interface TimelineEntryData {
  id: string;
  name: string;
  organizer?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  result: Hackathon["result"];
  rank?: string | null;
  prize?: string | null;
  projectName?: string | null;
  learnings?: string | null;
}

/** Sort key: earliest known date first; rows without dates sort last. */
function sortKey(hackathon: Hackathon): string {
  return (
    hackathon.startDate ??
    hackathon.endDate ??
    hackathon.createdAt ??
    ""
  );
}

/** Attended hackathons, oldest first. */
export function getAttendedHackathons(hackathons: Hackathon[]): Hackathon[] {
  return hackathons
    .filter((h) => h.status === "attended")
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

export function toTimelineEntry(hackathon: Hackathon): TimelineEntryData {
  return {
    id: hackathon.id,
    name: hackathon.name,
    organizer: hackathon.organizer,
    location: hackathon.location,
    startDate: hackathon.startDate,
    endDate: hackathon.endDate,
    result: hackathon.result,
    rank: hackathon.rank,
    prize: hackathon.prize,
    projectName: hackathon.projectName,
    learnings: hackathon.learnings,
  };
}

/** Chronological accumulation of attended hackathons. */
export function buildTimeline(hackathons: Hackathon[]): TimelineEntryData[] {
  return getAttendedHackathons(hackathons).map(toTimelineEntry);
}

/** Display label for an entry's date range. */
export function formatEntryDates(entry: Pick<
  TimelineEntryData,
  "startDate" | "endDate"
>): string {
  if (entry.startDate && entry.endDate) {
    return entry.startDate === entry.endDate
      ? entry.startDate
      : `${entry.startDate} → ${entry.endDate}`;
  }
  return entry.startDate ?? entry.endDate ?? "Date TBD";
}
