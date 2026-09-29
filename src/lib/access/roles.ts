/**
 * Canonical team roles (Track A — PAY-9).
 * Client-safe: pure constants + helpers, no server imports.
 */

export const TEAM_ROLES = ["owner", "member", "viewer"] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  member: "Member",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: "Full control: edit the team, manage members and roles, rotate invites.",
  member: "Contribute: edit the team and use invite codes.",
  viewer: "Read-only: view the team and its roster.",
};

/** Higher number = more privilege. */
const ROLE_RANK: Record<TeamRole, number> = {
  viewer: 1,
  member: 2,
  owner: 3,
};

export function isValidRole(value: unknown): value is TeamRole {
  return (
    typeof value === "string" && (TEAM_ROLES as readonly string[]).includes(value)
  );
}

export function normalizeRole(value: unknown, fallback: TeamRole = "member"): TeamRole {
  return isValidRole(value) ? value : fallback;
}

/** Compare privilege: >0 means `a` outranks `b`. */
export function compareRoles(a: TeamRole, b: TeamRole): number {
  return ROLE_RANK[a] - ROLE_RANK[b];
}

export function isOwner(role: TeamRole | null | undefined): boolean {
  return role === "owner";
}

/** Highest-privilege role in a set (null when empty). */
export function highestRole(roles: readonly TeamRole[]): TeamRole | null {
  let best: TeamRole | null = null;
  for (const r of roles) {
    if (best === null || compareRoles(r, best) > 0) best = r;
  }
  return best;
}
