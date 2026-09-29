"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Track A contract: cross-track back-links use plain <a> anchors */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeams } from "@/lib/teams/actions";
import type { NewTeam } from "@/lib/teams/types";

export default function NewTeamPage() {
  const router = useRouter();
  const { createTeam } = useTeams();
  const [ownerName, setOwnerName] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubmit(input: NewTeam) {
    setSaving(true);
    const team = createTeam(input, ownerName.trim() ? ownerName.trim() : undefined);
    router.push(`/teams/${team.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:pb-8">
      <nav className="flex items-center gap-4 text-sm">
        <a href="/teams" className="underline-offset-4 hover:underline">
          Teams
        </a>
        <a href="/hackathons" className="underline-offset-4 hover:underline">
          Hackathons
        </a>
      </nav>

      <h1 className="text-xl font-semibold">New team</h1>

      <div className="space-y-2">
        <Label htmlFor="team-owner">Your name (becomes team owner)</Label>
        <Input
          id="team-owner"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="e.g. Ada Lovelace"
          maxLength={80}
        />
      </div>

      <TeamForm submitting={saving} onSubmit={handleSubmit} />
    </main>
  );
}
