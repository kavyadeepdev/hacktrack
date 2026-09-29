import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Teams + RBAC + invites schema (Track A — PAY-8 / PAY-9 / PAY-14).
 * Own ids plus a loose `hackathonId: text` join key — no FKs, and no
 * edits to the core `hackathons` table in `src/db/schema.ts`.
 * Server-only: never import this (or `getDb()`) from `"use client"` modules.
 */

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  hackathonId: text("hackathon_id"),
  inviteCode: text("invite_code"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  userId: text("user_id"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamInvites = pgTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accessAudit = pgTable("access_audit", {
  id: text("id").primaryKey(),
  teamId: text("team_id"),
  actor: text("actor"),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TeamRow = typeof teams.$inferSelect;
export type NewTeamRow = typeof teams.$inferInsert;
export type TeamMemberRow = typeof teamMembers.$inferSelect;
export type NewTeamMemberRow = typeof teamMembers.$inferInsert;
export type TeamInviteRow = typeof teamInvites.$inferSelect;
export type NewTeamInviteRow = typeof teamInvites.$inferInsert;
export type AccessAuditRow = typeof accessAudit.$inferSelect;
export type NewAccessAuditRow = typeof accessAudit.$inferInsert;
