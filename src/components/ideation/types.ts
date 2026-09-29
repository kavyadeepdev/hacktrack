/**
 * Ideation domain (Track B — PAY-17 / B3).
 * Lives under `src/components/ideation/` (per-issue ownership) so the
 * track stays greenfield: no imports from Track A stores/types.
 * The Postgres shape will live in `src/db/workspace-schema.ts`
 * (a later Track B issue); the MVP persists via localStorage.
 */

export type IdeaStatus = "draft" | "implemented" | "dropped";

export const IDEA_STATUSES: IdeaStatus[] = ["draft", "implemented", "dropped"];

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  draft: "Draft",
  implemented: "Implemented",
  dropped: "Dropped",
};

export interface Idea {
  id: string;
  /** Loose join key to a hackathon. Never a FK, never edits core tables. */
  hackathonId: string;
  text: string;
  status: IdeaStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface NewIdea {
  hackathonId: string;
  text: string;
}

export function isIdeaStatus(value: unknown): value is IdeaStatus {
  return (
    typeof value === "string" && (IDEA_STATUSES as string[]).includes(value)
  );
}
