/**
 * Reminders API (Track B — PAY-16 / B2).
 * MVP note: deadline rows live in localStorage (`useDeadlines()`), so
 * this route is a stateless feed: POST deadlines, get back the
 * overdue / due-soon / upcoming split computed in
 * `src/lib/deadlines/reminders.ts`.
 */
import {
  DUE_SOON_WINDOW_DAYS,
  getReminderStates,
} from "@/lib/deadlines/reminders";
import { parseDeadlineInput } from "@/lib/deadlines/types";

interface RemindersBody {
  deadlines?: unknown;
  now?: unknown;
  windowDays?: unknown;
  hackathonId?: unknown;
}

function parseWindowDays(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(30, Math.max(1, Math.floor(value)));
  }
  return DUE_SOON_WINDOW_DAYS;
}

function parseNow(value: unknown): Date {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value);
  }
  return new Date();
}

export async function GET() {
  return Response.json({
    status: "ok",
    windowDays: DUE_SOON_WINDOW_DAYS,
    hint: "POST { deadlines: NewDeadline[], now?: ISO, windowDays?: number, hackathonId?: string } for the upcoming-deadline feed.",
  });
}

export async function POST(request: Request) {
  let json: unknown = null;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof json !== "object" || json === null) {
    return Response.json(
      { message: "Body must include deadlines: array." },
      { status: 400 }
    );
  }
  const body = json as RemindersBody;
  if (!Array.isArray(body.deadlines)) {
    return Response.json(
      { message: "Body must include deadlines: array." },
      { status: 400 }
    );
  }
  const windowDays = parseWindowDays(body.windowDays);
  const now = parseNow(body.now);
  const hackathonId =
    typeof body.hackathonId === "string" && body.hackathonId.length > 0
      ? body.hackathonId
      : null;

  const parsed = body.deadlines.map((entry, index) => {
    const row = parseDeadlineInput(entry);
    if (!row) return { index, ok: false as const };
    if (hackathonId && row.hackathonId !== hackathonId) {
      return { index, ok: false as const, reason: "hackathonId mismatch" };
    }
    return { index, ok: true as const, row };
  });
  const invalid = parsed.filter((p) => !p.ok);
  if (invalid.length > 0) {
    return Response.json(
      {
        message: `deadlines[${invalid.map((p) => p.index).join(",")}] must be { hackathonId, title, dueDate: ISO, type }.`,
      },
      { status: 400 }
    );
  }
  const rows = parsed.flatMap((p) =>
    p.ok
      ? [
          {
            ...p.row,
            id: `api-${p.index}`,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        ]
      : []
  );
  const states = getReminderStates(rows, now, windowDays);
  return Response.json({
    now: now.toISOString(),
    windowDays,
    overdue: states
      .filter((s) => s.state === "overdue")
      .map((s) => ({ ...s.deadline, daysUntil: s.daysUntil })),
    dueSoon: states
      .filter((s) => s.state === "due-soon")
      .map((s) => ({ ...s.deadline, daysUntil: s.daysUntil })),
    upcoming: states
      .filter((s) => s.state === "upcoming")
      .map((s) => ({ ...s.deadline, daysUntil: s.daysUntil })),
  });
}
