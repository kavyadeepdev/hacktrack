/**
 * Team formation domain types (Track A — PAY-8).
 * Client-safe: no `src/db/*` imports here. The localStorage MVP shape
 * mirrors these types; the Postgres shape lives in `src/db/teams-schema.ts`.
 */

import type { TeamRole } from "@/lib/access/roles";

export type { TeamRole };

export interface TeamMember {
  id: string;
  teamId: string;
  /** Loose identity — no FK to a users table in the MVP. */
  userId?: string | null;
  displayName: string;
  email?: string | null;
  role: TeamRole;
  joinedAt: string; // ISO
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  /** Loose join key to a hackathon. Never a FK, never edits the core table. */
  hackathonId?: string | null;
  /** Latest active invite code (convenience copy; authority is TeamInvite). */
  inviteCode?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** A team with its roster attached (detail view shape). */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface NewTeam {
  name: string;
  description?: string | null;
  hackathonId?: string | null;
}

export interface NewTeamMember {
  displayName: string;
  email?: string | null;
  userId?: string | null;
  role?: TeamRole;
}
