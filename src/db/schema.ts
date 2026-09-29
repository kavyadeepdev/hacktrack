import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

/**
 * Neon Postgres schema for HackTrack.
 * Run with drizzle-kit once `DATABASE_URL` is set (see docs/neon.md).
 *
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 */

export const hackathonStatusEnum = pgEnum("hackathon_status", [
  "reviewing",
  "planning_to_apply",
  "applied",
  "accepted",
  "attended",
  "declined",
  "skipped",
]);

export const resultStatusEnum = pgEnum("result_status", [
  "none",
  "won",
  "finalist",
  "submitted_no_place",
  "did_not_submit",
  "no_show",
]);

export const hackathons = pgTable("hackathons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizer: text("organizer"),
  location: text("location"),
  isRemote: boolean("is_remote").notNull().default(false),
  startDate: text("start_date"),
  endDate: text("end_date"),
  applicationDeadline: text("application_deadline"),
  url: text("url"),
  status: hackathonStatusEnum("status").notNull().default("reviewing"),
  result: resultStatusEnum("result").notNull().default("none"),
  rank: text("rank"),
  prize: text("prize"),
  technologies: text("technologies").array().notNull().default([]),
  teamMembers: text("team_members").array().notNull().default([]),
  projectName: text("project_name"),
  projectUrl: text("project_url"),
  repoUrl: text("repo_url"),
  notes: text("notes"),
  learnings: text("learnings"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type HackathonRow = typeof hackathons.$inferSelect;
export type NewHackathonRow = typeof hackathons.$inferInsert;
