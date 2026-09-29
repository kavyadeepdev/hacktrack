/**
 * Permission matrix for team RBAC (Track A — PAY-9).
 * Client-safe: pure data + helpers, no server imports.
 */

import type { TeamRole } from "./roles";

export type TeamPermission =
  | "team:view"
  | "team:edit"
  | "team:delete"
  | "team:invite"
  | "member:add"
  | "member:change-role"
  | "member:remove";

export const ROLE_PERMISSIONS: Record<TeamRole, readonly TeamPermission[]> = {
  owner: [
    "team:view",
    "team:edit",
    "team:delete",
    "team:invite",
    "member:add",
    "member:change-role",
    "member:remove",
  ],
  member: ["team:view", "team:edit", "team:invite", "member:add"],
  viewer: ["team:view"],
};

export function hasPermission(role: TeamRole, permission: TeamPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Null/undefined role (non-member) can do nothing. */
export function canPerform(
  role: TeamRole | null | undefined,
  permission: TeamPermission
): boolean {
  if (role == null) return false;
  return hasPermission(role, permission);
}

/** Permissions granted to a role (stable copy for UI rendering). */
export function permissionsFor(role: TeamRole): TeamPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}
