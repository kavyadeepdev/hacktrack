import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { accessAudit, teamMembers, teams } from "@/db/teams-schema";

/**
 * GET /api/teams — list teams (server-only).
 * POST — create a team + owner membership + audit row (server-only).
 * Returns 501 when DATABASE_URL is not configured (localStorage MVP mode).
 */

function dbOrNull() {
  try {
    return getDb();
  } catch {
    return null;
  }
}

function noStore() {
  return NextResponse.json(
    { error: "Team store unavailable: DATABASE_URL is not set." },
    { status: 501 }
  );
}

export async function GET() {
  const db = dbOrNull();
  if (!db) return noStore();
  const rows = await db.select().from(teams);
  return NextResponse.json({ teams: rows });
}

export async function POST(req: NextRequest) {
  const db = dbOrNull();
  if (!db) return noStore();
  const body = (await req.json().catch(() => null)) as {
    name?: unknown;
    description?: unknown;
    hackathonId?: unknown;
    ownerName?: unknown;
    actor?: unknown;
  } | null;

  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const teamId = `team-${crypto.randomUUID()}`;
  const [team] = await db
    .insert(teams)
    .values({
      id: teamId,
      name: body.name.trim(),
      description: typeof body.description === "string" ? body.description : null,
      hackathonId: typeof body.hackathonId === "string" ? body.hackathonId : null,
    })
    .returning();

  if (typeof body.ownerName === "string" && body.ownerName.trim()) {
    await db.insert(teamMembers).values({
      id: `member-${crypto.randomUUID()}`,
      teamId,
      displayName: body.ownerName.trim(),
      role: "owner",
    });
  }

  const actor =
    typeof body.actor === "string"
      ? body.actor
      : typeof body.ownerName === "string"
        ? body.ownerName
        : null;
  try {
    await db.insert(accessAudit).values({
      id: `audit-${crypto.randomUUID()}`,
      teamId,
      actor,
      action: "team:create",
      detail: `Created team ${team.name}.`,
    });
  } catch {
    // audit is best-effort
  }

  return NextResponse.json(team, { status: 201 });
}
