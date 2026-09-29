/**
 * Deadlines domain (Track B — PAY-15 / B1).
 * Client-safe + server-safe: no `src/db/*`, no window access here.
 * The Postgres shape will live in `src/db/workspace-schema.ts`
 * (a later Track B issue); the MVP persists via localStorage in
 * `./storage.ts`. Loose `hackathonId: string` join key, never a FK.
 */

export type DeadlineType =
  | "application"
  | "registration"
  | "submission"
  | "demo"
  | "other";

export const DEADLINE_TYPES: DeadlineType[] = [
  "application",
  "registration",
  "submission",
  "demo",
  "other",
];

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  application: "Application",
  registration: "Registration",
  submission: "Submission",
  demo: "Demo",
  other: "Other",
};

export const DEADLINE_TYPE_OPTIONS = DEADLINE_TYPES.map((value) => ({
  value,
  label: DEADLINE_TYPE_LABELS[value],
}));

export interface Deadline {
  id: string;
  /** Loose join key to a hackathon. Never a FK, never edits core tables. */
  hackathonId: string;
  title: string;
  /** ISO datetime (`datetime-local` input value or full ISO string). */
  dueDate: string;
  type: DeadlineType;
  notes?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface NewDeadline {
  hackathonId: string;
  title: string;
  dueDate: string;
  type: DeadlineType;
  notes?: string | null;
}

export function isDeadlineType(value: unknown): value is DeadlineType {
  return (
    typeof value === "string" &&
    (DEADLINE_TYPES as string[]).includes(value)
  );
}

export function parseDeadlineInput(value: unknown): NewDeadline | null {
  if (typeof value !== "object" || value === null) return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.hackathonId !== "string" ||
    body.hackathonId.trim().length === 0
  ) {
    return null;
  }
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return null;
  }
  if (typeof body.dueDate !== "string" || Number.isNaN(Date.parse(body.dueDate))) {
    return null;
  }
  if (!isDeadlineType(body.type)) return null;
  const notes =
    typeof body.notes === "string" && body.notes.trim().length > 0
      ? body.notes.trim()
      : null;
  return {
    hackathonId: body.hackathonId.trim(),
    title: body.title.trim(),
    dueDate: body.dueDate,
    type: body.type,
    notes,
  };
}
