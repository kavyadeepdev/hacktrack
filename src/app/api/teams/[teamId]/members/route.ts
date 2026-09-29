import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessAudit, teamMembers } from "@/db/teams-schema";

/**
 * POST /api/teams/[teamId]/members — add a member (server-only).
 * PATCH — change a member's role. DELETE — remove a member.
 * All mutations append an `access_audit` row (PAY-14).
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

async function audit(
  teamId: string,
  actor: string | null,
  action: string,
  detail: string | null
) {
  const db = dbOrNull();
  if (!db) return;
  try {
    await db.insert(accessAudit).values({
      id: `audit-${crypto.randomUUID()}`,
      teamId,
      actor,
      action,
      detail,
    });
  } catch {
    // audit is best-effort
  }
}

type Ctx = { params: Promise<{ teamId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const db = dbOrNull();
  if (!db) return noStore();
  const { teamId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    displayName?: unknown;
    email?: unknown;
    userId?: unknown;
    role?: unknown;
    actor?: unknown;
  } | null;

  if (!body || typeof body.displayName !== "string" || !body.displayName.trim()) {
    return NextResponse.json({ error: "displayName is required." }, { status: 400 });
  }
  const role = body.role === "owner" || body.role === "viewer" ? body.role : "member";

  const [member] = await db
    .insert(teamMembers)
    .values({
      id: `member-${crypto.randomUUID()}`,
      teamId,
      userId: typeof body.userId === "string" ? body.userId : null,
      displayName: body.displayName.trim(),
      email: typeof body.email === "string" ? body.email : null,
      role,
    })
    .returning();

  await audit(
    teamId,
    typeof body.actor === "string" ? body.actor : null,
    "member:add",
    `Added ${member.displayName} as ${role}.`
  );
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const db = dbOrNull();
  if (!db) return noStore();
  const { teamId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    memberId?: unknown;
    role?: unknown;
    actor?: unknown;
  } | null;

  if (!body || typeof body.memberId !== "string") {
    return NextResponse.json({ error: "memberId is required." }, { status: 400 });
  }
  if (body.role !== "owner" && body.role !== "member" && body.role !== "viewer") {
    return NextResponse.json(
      { error: "role must be owner, member, or viewer." },
      { status: 400 }
    );
  }

  // Last-owner guard: refuse to demote the final owner.
  if (body.role !== "owner") {
    const roster = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
    const target = roster.find((m) => m.id === body.memberId);
    if (target && target.role === "owner") {
      const otherOwners = roster.filter(
        (m) => m.id !== body.memberId && m.role === "owner"
      );
      if (otherOwners.length === 0) {
        return NextResponse.json(
          { error: "Cannot demote the last owner. Assign another owner first." },
          { status: 409 }
        );
      }
    }
  }

  const [updated] = await db
    .update(teamMembers)
    .set({ role: body.role })
    .where(eq(teamMembers.id, body.memberId as string))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  await audit(
    teamId,
    typeof body.actor === "string" ? body.actor : null,
    "member:change-role",
    `Changed ${updated.displayName} to ${body.role}.`
  );
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const db = dbOrNull();
  if (!db) return noStore();
  const { teamId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    memberId?: unknown;
    actor?: unknown;
  } | null;

  if (!body || typeof body.memberId !== "string") {
    return NextResponse.json({ error: "memberId is required." }, { status: 400 });
  }

  const roster = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));
  const target = roster.find((m) => m.id === body.memberId);
  if (!target) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  if (target.role === "owner") {
    const otherOwners = roster.filter(
      (m) => m.id !== body.memberId && m.role === "owner"
    );
    if (otherOwners.length === 0) {
      return NextResponse.json(
        { error: "Cannot remove the last owner. Assign another owner first." },
        { status: 409 }
      );
    }
  }

  await db.delete(teamMembers).where(eq(teamMembers.id, body.memberId));
  await audit(
    teamId,
    typeof body.actor === "string" ? body.actor : null,
    "member:remove",
    `Removed ${target.displayName}.`
  );
  return NextResponse.json({ ok: true });
}
