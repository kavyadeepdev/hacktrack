"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface OutcomeNotes {
  hackathonId: string;
  notes: string;
  learnings: string;
  workedWell: string;
  updatedAt: string;
}

function storageKey(hackathonId: string): string {
  return `hacktrack:workspace:${hackathonId}:outcome-notes:v1`;
}

function loadNotes(hackathonId: string): OutcomeNotes | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(hackathonId));
    if (!raw) return null;
    return JSON.parse(raw) as OutcomeNotes;
  } catch {
    return null;
  }
}

export function NotesEditor({
  hackathonId,
  onSaved,
}: {
  hackathonId: string;
  onSaved?: (row: OutcomeNotes) => void;
}) {
  const [notes, setNotes] = useState("");
  const [learnings, setLearnings] = useState("");
  const [workedWell, setWorkedWell] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadNotes(hackathonId);
    if (existing) {
      // Post-mount sync from localStorage (external system): stored rows can
      // only be read client-side after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(existing.notes ?? "");
      setLearnings(existing.learnings ?? "");
      setWorkedWell(existing.workedWell ?? "");
      setSavedAt(existing.updatedAt);
    }
    setHydrated(true);
  }, [hackathonId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const row: OutcomeNotes = {
      hackathonId,
      notes: notes.trim(),
      learnings: learnings.trim(),
      workedWell: workedWell.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(storageKey(hackathonId), JSON.stringify(row));
    } catch {
      // storage full / private mode — non-fatal
    }
    setSavedAt(row.updatedAt);
    onSaved?.(row);
  }

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="notes-ongoing">Ongoing notes</Label>
        <Textarea
          id="notes-ongoing"
          placeholder="Running log: ideas, blockers, decisions…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes-learnings">What did you learn?</Label>
        <Textarea
          id="notes-learnings"
          placeholder="Retrospective: new skills, concepts, mistakes to avoid…"
          value={learnings}
          onChange={(e) => setLearnings(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes-worked">What worked well?</Label>
        <Textarea
          id="notes-worked"
          placeholder="Keep doing this next time: teamwork, stack, prep…"
          value={workedWell}
          onChange={(e) => setWorkedWell(e.target.value)}
        />
      </div>
      {savedAt && (
        <p className="text-xs text-muted-foreground">
          Last saved {new Date(savedAt).toLocaleString()}
        </p>
      )}
      <Button type="submit" className="min-h-[44px] w-full sm:w-auto">
        Save notes
      </Button>
    </form>
  );
}
