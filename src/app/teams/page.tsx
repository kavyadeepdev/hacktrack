"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Track A contract: cross-track back-links use plain <a> anchors */

import { TeamCard } from "@/components/teams/team-card";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/lib/teams/actions";

export default function TeamsPage() {
  const { teamsWithMembers, hydrated } = useTeams();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:pb-8">
      <nav className="flex items-center gap-4 text-sm">
        <a href="/hackathons" className="underline-offset-4 hover:underline">
          Hackathons
        </a>
        <a href="/timeline" className="underline-offset-4 hover:underline">
          Timeline
        </a>
      </nav>

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Teams</h1>
        <Button asChild>
          <a href="/teams/new">New team</a>
        </Button>
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading teams…</p>
      ) : teamsWithMembers.length === 0 ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            No teams yet. Create one to start forming a crew for a hackathon.
          </p>
          <Button asChild>
            <a href="/teams/new">Create your first team</a>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {teamsWithMembers.map((t) => (
            <li key={t.id}>
              <TeamCard team={t} memberCount={t.members.length} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
