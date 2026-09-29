/**
 * Client-side MVP store for teams (Track A — PAY-8).
 * Same localStorage pattern as `src/lib/store.ts` (separate key),
 * so the teams UI is fully usable before Neon is wired up.
 * Never import `getDb()` here — this module is `"use client"`.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeRole, type TeamRole } from "@/lib/access/roles";
import type {
  NewTeam,
  NewTeamMember,
  Team,
  TeamMember,
  TeamWithMembers,
} from "@/lib/teams/types";
import { buildInvite } from "@/lib/teams/invites";

const KEY = "hacktrack:teams:v1";

interface StoredTeam extends Team {
  members: TeamMember[];
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function load(): StoredTeam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw) as StoredTeam[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(rows: StoredTeam[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal for MVP
  }
}

function toDetail(row: StoredTeam): TeamWithMembers {
  const { members, ...team } = row;
  return { ...team, members };
}

export function useTeams() {
  const [rows, setRows] = useState<StoredTeam[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): SSR/prerender has
    // no window, so stored rows can only be read client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(load());
    setHydrated(true);
  }, []);

  const createTeam = useCallback((input: NewTeam, ownerName?: string) => {
    const now = new Date().toISOString();
    const team: StoredTeam = {
      id: newId("team"),
      name: input.name.trim(),
      description: input.description?.trim() ? input.description.trim() : null,
      hackathonId:
        input.hackathonId && input.hackathonId.trim() ? input.hackathonId.trim() : null,
      inviteCode: null,
      createdAt: now,
      updatedAt: now,
      members: [],
    };
    const invite = buildInvite(team.id);
    team.inviteCode = invite.code;
    if (ownerName && ownerName.trim()) {
      team.members.push({
        id: newId("member"),
        teamId: team.id,
        userId: null,
        displayName: ownerName.trim(),
        email: null,
        role: "owner",
        joinedAt: now,
      });
    }
    setRows((prev) => {
      const next = [team, ...prev];
      persist(next);
      return next;
    });
    return toDetail(team);
  }, []);

  const updateTeam = useCallback((id: string, patch: Partial<Pick<Team, "name" | "description" | "hackathonId">>) => {
    setRows((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...(patch.name !== undefined ? { name: patch.name.trim() } : null),
              ...(patch.description !== undefined
                ? { description: patch.description?.trim() ? patch.description.trim() : null }
                : null),
              ...(patch.hackathonId !== undefined
                ? {
                    hackathonId:
                      patch.hackathonId && patch.hackathonId.trim()
                        ? patch.hackathonId.trim()
                        : null,
                  }
                : null),
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      persist(next);
      return next;
    });
  }, []);

  const removeTeam = useCallback((id: string) => {
    setRows((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const getTeam = useCallback(
    (id: string): TeamWithMembers | null => {
      const found = rows.find((t) => t.id === id);
      return found ? toDetail(found) : null;
    },
    [rows]
  );

  const addMember = useCallback((teamId: string, input: NewTeamMember) => {
    const now = new Date().toISOString();
    const member: TeamMember = {
      id: newId("member"),
      teamId,
      userId: input.userId ?? null,
      displayName: input.displayName.trim(),
      email: input.email?.trim() ? input.email.trim() : null,
      role: normalizeRole(input.role, "member"),
      joinedAt: now,
    };
    let added: TeamMember | null = null;
    setRows((prev) => {
      const next = prev.map((t) => {
        if (t.id !== teamId) return t;
        added = member;
        return { ...t, members: [...t.members, member], updatedAt: now };
      });
      persist(next);
      return next;
    });
    return added ?? member;
  }, []);

  const updateMemberRole = useCallback(
    (teamId: string, memberId: string, role: TeamRole) => {
      setRows((prev) => {
        const next = prev.map((t) =>
          t.id === teamId
            ? {
                ...t,
                members: t.members.map((m) =>
                  m.id === memberId ? { ...m, role } : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        persist(next);
        return next;
      });
    },
    []
  );

  const removeMember = useCallback((teamId: string, memberId: string) => {
    setRows((prev) => {
      const next = prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.filter((m) => m.id !== memberId),
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      persist(next);
      return next;
    });
  }, []);

  const rotateInviteCode = useCallback((teamId: string) => {
    const invite = buildInvite(teamId);
    setRows((prev) => {
      const next = prev.map((t) =>
        t.id === teamId
          ? { ...t, inviteCode: invite.code, updatedAt: new Date().toISOString() }
          : t
      );
      persist(next);
      return next;
    });
    return invite.code;
  }, []);

  const teams: Team[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    hackathonId: r.hackathonId,
    inviteCode: r.inviteCode,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  const teamsWithMembers: TeamWithMembers[] = rows.map(toDetail);

  return {
    teams,
    teamsWithMembers,
    hydrated,
    createTeam,
    updateTeam,
    removeTeam,
    getTeam,
    addMember,
    updateMemberRole,
    removeMember,
    rotateInviteCode,
  };
}
