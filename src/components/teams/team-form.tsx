"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NewTeam } from "@/lib/teams/types";

interface TeamFormProps {
  initial?: Partial<NewTeam>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: NewTeam) => void;
}

export function TeamForm({
  initial,
  submitting = false,
  submitLabel = "Create team",
  onSubmit,
}: TeamFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [hackathonId, setHackathonId] = useState(initial?.hackathonId ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      hackathonId: hackathonId.trim() ? hackathonId.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="team-name">Team name</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Night Owls"
          required
          maxLength={80}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-description">Description (optional)</Label>
        <Textarea
          id="team-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this team about?"
          maxLength={500}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-hackathon">Hackathon ID (optional)</Label>
        <Input
          id="team-hackathon"
          value={hackathonId}
          onChange={(e) => setHackathonId(e.target.value)}
          placeholder="Loose join key, e.g. hack-123"
          maxLength={120}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
