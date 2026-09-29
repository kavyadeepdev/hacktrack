/**
 * Invite-code helpers: issue, validate, expire (Track A — PAY-14).
 * Client-safe pure functions. Persistence lives in `team_invites`
 * (`src/db/teams-schema.ts`) on the server and in the teams localStorage
 * store on the client; this module never touches either.
 */

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const INVITE_CODE_PREFIX = "HT";

export interface TeamInvite {
  id: string;
  teamId: string;
  code: string;
  expiresAt: string | null; // ISO; null = never expires
  revoked: boolean;
  createdAt: string; // ISO
}

export interface InviteValidation {
  ok: boolean;
  reason?:
    | "not-found"
    | "mismatch"
    | "revoked"
    | "expired";
}

/** `HT-XXXXXX` — unambiguous alphabet (no 0/O, 1/I). */
export function generateInviteCode(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(random() * alphabet.length)];
  }
  return `${INVITE_CODE_PREFIX}-${suffix}`;
}

export function buildInvite(
  teamId: string,
  opts?: { ttlMs?: number | null; id?: string; now?: Date }
): TeamInvite {
  const now = opts?.now ?? new Date();
  const ttl = opts?.ttlMs === undefined ? INVITE_TTL_MS : opts.ttlMs;
  return {
    id:
      opts?.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `invite-${now.getTime()}`),
    teamId,
    code: generateInviteCode(),
    expiresAt: ttl == null ? null : new Date(now.getTime() + ttl).toISOString(),
    revoked: false,
    createdAt: now.toISOString(),
  };
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isInviteExpired(
  invite: Pick<TeamInvite, "expiresAt">,
  now: Date = new Date()
): boolean {
  if (!invite.expiresAt) return false;
  return new Date(invite.expiresAt).getTime() <= now.getTime();
}

/** Validate a presented code against the active invite record. */
export function validateInvite(
  invite: TeamInvite | null | undefined,
  presentedCode: string,
  now: Date = new Date()
): InviteValidation {
  if (!invite) return { ok: false, reason: "not-found" };
  if (invite.revoked) return { ok: false, reason: "revoked" };
  if (normalizeCode(invite.code) !== normalizeCode(presentedCode)) {
    return { ok: false, reason: "mismatch" };
  }
  if (isInviteExpired(invite, now)) return { ok: false, reason: "expired" };
  return { ok: true };
}

/** Pick the single usable invite (newest non-revoked, non-expired). */
export function activeInvite(
  invites: readonly TeamInvite[],
  now: Date = new Date()
): TeamInvite | null {
  const usable = invites
    .filter((i) => !i.revoked && !isInviteExpired(i, now))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return usable[0] ?? null;
}
