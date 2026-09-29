import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessAudit, teamInvites, teams } from "@/db/teams-schema";
import { buildInvite, INVITE_TTL_MS } from "@/lib/teams/invites";

/**
 * GET /api/teams/[teamId]/invite — current active invite (server-only).
 * POST — issue/rotate: revokes active codes, creates a fresh one with
 * 7-day expiry, stamps the team row, and writes an `access_audit` row.
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

type Ctx = { params: Promise<{ teamId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const db = dbOrNull();
  if (!db) return noStore();
  const { teamId } = await ctx.params;

  const rows = await db
    .select()
    .from(teamInvites)
    .where(
      and(eq(teamInvites.teamId, teamId), eq(teamInvites.revoked, false))
    )
    .orderBy(desc(teamInvites.createdAt))
    .limit(1);

  const invite = rows[0] ?? null;
  if (!invite) return NextResponse.json({ invite: null });
  if (invite.expiresAt && invite.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ invite: null, expired: true });
  }
  return NextResponse.json({ invite });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const db = dbOrNull();
  if (!db) return noStore();
  const { teamId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    ttlMs?: unknown;
    actor?: unknown;
  };

  const ttlMs =
    body.ttlMs === null || body.ttlMs === undefined
      ? INVITE_TTL_MS
      : typeof body.ttlMs === "number" && body.ttlMs > 0
        ? body.ttlMs
        : INVITE_TTL_MS;

  // Revoke previous active codes (rotation).
  await db
    .update(teamInvites)
    .set({ revoked: true })
    .where(
      and(eq(teamInvites.teamId, teamId), eq(teamInvites.revoked, false))
    );

  const draft = buildInvite(teamId, { ttlMs });
  const [invite] = await db
    .insert(teamInvites)
    .values({
      id: draft.id,
      teamId,
      code: draft.code,
      expiresAt: draft.expiresAt ? new Date(draft.expiresAt) : null,
    })
    .returning();

  await db
    .update(teams)
    .set({ inviteCode: invite.code, updatedAt: new Date() })
    .where(eq(teams.id, teamId));

  const actor = typeof body.actor === "string" ? body.actor : null;
  try {
    await db.insert(accessAudit).values({
      id: `audit-${crypto.randomUUID()}`,
      teamId,
      actor,
      action: "invite:rotate",
      detail: `Issued invite ${invite.code}.`,
    });
  } catch {
    // audit is best-effort
  }

  return NextResponse.json({ code: invite.code, invite }, { status: 201 });
}
