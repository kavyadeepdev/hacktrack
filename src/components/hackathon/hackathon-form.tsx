"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  RESULT_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { useHackathons } from "@/lib/store";
import type { HackathonStatus, ResultStatus } from "@/lib/types";

export function HackathonForm() {
  const router = useRouter();
  const { add } = useHackathons();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<HackathonStatus>("reviewing");
  const [result, setResult] = useState<ResultStatus>("none");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the hackathon a name.");
      return;
    }
    const row = add({
      name: name.trim(),
      organizer: null,
      location: location.trim() || null,
      isRemote: location.trim().toLowerCase() === "remote",
      startDate: startDate || null,
      endDate: null,
      applicationDeadline: deadline || null,
      url: url.trim() || null,
      status,
      result,
      rank: null,
      prize: null,
      technologies: [],
      teamMembers: [],
      projectName: null,
      projectUrl: null,
      repoUrl: null,
      notes: notes.trim() || null,
      learnings: null,
    });
    router.push(`/hackathons/${row.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Hackathon name *</Label>
        <Input
          id="name"
          placeholder="e.g. City Hack 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Pipeline status</Label>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as HackathonStatus)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="result">Result</Label>
          <Select
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value as ResultStatus)}
            options={RESULT_OPTIONS}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="url">Event URL</Label>
        <Input
          id="url"
          inputMode="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location (or “Remote”)</Label>
          <Input
            id="location"
            placeholder="Remote / Berlin, DE"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start">Start date</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deadline">Application deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Why is this interesting? judging criteria, team ideas…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full sm:w-auto">
        Save hackathon
      </Button>
    </form>
  );
}
