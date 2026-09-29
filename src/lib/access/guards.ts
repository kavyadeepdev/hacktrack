/**
 * Guard helpers for team RBAC (Track A — PAY-9).
 * Client-safe pure functions shared by pages, components, and API routes.
 * Never import `getDb()` here or in any `"use client"` module.
 */

import { normalizeRole, type TeamRole } from "./roles";
import { canPerform, type TeamPermission } from "./permissions";

export class AccessDeniedError extends Error {
  permission: TeamPermission;
  constructor(permission: TeamPermission, role?: TeamRole | null) {
    super(
      `Access denied: role "${role ?? "none"}" cannot perform "${permission}".`
    );
    this.name = "AccessDeniedError";
    this.permission = permission;
  }
}

/** Throw AccessDeniedError unless the role grants the permission. */
export function assertCan(
  role: TeamRole | null | undefined,
  permission: TeamPermission
): void {
  if (!canPerform(role, permission)) {
    throw new AccessDeniedError(permission, role);
  }
}

/** Resolve the actor's role from a roster (null when not a member). */
export function roleOf(
  members: readonly { userId?: string | null; email?: string | null; role: TeamRole }[],
  identity: { userId?: string | null; email?: string | null }
): TeamRole | null {
  const found = members.find((m) => {
    if (identity.userId && m.userId) return m.userId === identity.userId;
    if (identity.email && m.email)
      return m.email.toLowerCase() === identity.email.toLowerCase();
    return false;
  });
  return found ? normalizeRole(found.role) : null;
}

export function canEditTeam(role: TeamRole | null | undefined): boolean {
  return canPerform(role, "team:edit");
}

export function canDeleteTeam(role: TeamRole | null | undefined): boolean {
  return canPerform(role, "team:delete");
}

export function canInvite(role: TeamRole | null | undefined): boolean {
  return canPerform(role, "team:invite");
}

export function canManageMembers(role: TeamRole | null | undefined): boolean {
  return canPerform(role, "member:change-role");
}

/**
 * An owner may not demote/remove themselves while they are the last owner.
 * Returns an error message when blocked, null when allowed.
 */
export function lastOwnerGuard(
  members: readonly { id: string; role: TeamRole }[],
  targetMemberId: string,
  nextRole: TeamRole | null // null = removal
): string | null {
  const target = members.find((m) => m.id === targetMemberId);
  if (!target || target.role !== "owner") return null;
  if (nextRole === "owner") return null;
  const otherOwners = members.filter((m) => m.id !== targetMemberId && m.role === "owner");
  if (otherOwners.length === 0) {
    return "Cannot demote or remove the last owner. Assign another owner first.";
  }
  return null;
}
