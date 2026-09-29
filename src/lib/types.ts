/**
 * Core domain types for HackTrack.
 * Keep in sync with `src/db/schema.ts` and `docs/data-model.md`.
 */

/** Pipeline stage of a hackathon entry. */
export type HackathonStatus =
  | "reviewing"
  | "planning_to_apply"
  | "applied"
  | "accepted"
  | "attended"
  | "declined"
  | "skipped";

/** Outcome after attending (or closing the loop without attending). */
export type ResultStatus =
  | "none"
  | "won"
  | "finalist"
  | "submitted_no_place"
  | "did_not_submit"
  | "no_show";

export interface Hackathon {
  id: string;
  name: string;
  organizer?: string | null;
  location?: string | null;
  isRemote: boolean;
  startDate?: string | null; // ISO date
  endDate?: string | null; // ISO date
  applicationDeadline?: string | null; // ISO date
  url?: string | null;
  status: HackathonStatus;
  result: ResultStatus;
  rank?: string | null; // e.g. "1st", "Top 10", "#42 / 300"
  prize?: string | null;
  technologies: string[];
  teamMembers: string[];
  projectName?: string | null;
  projectUrl?: string | null;
  repoUrl?: string | null;
  notes?: string | null;
  learnings?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type NewHackathon = Omit<Hackathon, "id" | "createdAt" | "updatedAt">;
