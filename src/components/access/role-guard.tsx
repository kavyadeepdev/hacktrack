"use client";

import type { ReactNode } from "react";
import type { TeamRole } from "@/lib/access/roles";
import { canPerform, type TeamPermission } from "@/lib/access/permissions";

interface RoleGuardProps {
  /** Actor's role on the team; null/undefined = non-member (denied). */
  role: TeamRole | null | undefined;
  allowed: readonly TeamRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Render children only when the actor's role is in `allowed`. */
export function RoleGuard({ role, allowed, fallback = null, children }: RoleGuardProps) {
  if (role == null || !allowed.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

interface PermissionGuardProps {
  role: TeamRole | null | undefined;
  permission: TeamPermission;
  fallback?: ReactNode;
  children: ReactNode;
}

/** Render children only when the actor's role grants `permission`. */
export function PermissionGuard({
  role,
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  if (!canPerform(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
