"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RoleBadge } from "@/components/access/role-badge";
import { canManageMembers } from "@/lib/access/guards";
import { TEAM_ROLES, type TeamRole } from "@/lib/access/roles";
import type { TeamMember } from "@/lib/teams/types";

interface MemberListProps {
  members: TeamMember[];
  /** Actor's role — controls are hidden without member-management rights. */
  actorRole: TeamRole | null | undefined;
  onChangeRole?: (memberId: string, role: TeamRole) => void;
  onRemove?: (memberId: string) => void;
}

const ROLE_OPTIONS = TEAM_ROLES.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

export function MemberList({ members, actorRole, onChangeRole, onRemove }: MemberListProps) {
  const canManage = canManageMembers(actorRole);

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.displayName}</p>
              {m.email ? (
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              ) : null}
            </div>
            <RoleBadge role={m.role} />
          </div>
          {canManage ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                aria-label={`Role for ${m.displayName}`}
                options={ROLE_OPTIONS}
                value={m.role}
                onChange={(e) =>
                  onChangeRole?.(m.id, e.target.value as TeamRole)
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onRemove?.(m.id)}
              >
                Remove
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
