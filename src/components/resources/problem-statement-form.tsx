"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProblemStatements } from "./problem-statement-card";

function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true; // source URL is optional
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProblemStatementForm({
  hackathonId,
  onSaved,
}: {
  hackathonId: string;
  onSaved?: () => void;
}) {
  const { add } = useProblemStatements(hackathonId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the problem statement a title.");
      return;
    }
    if (!body.trim()) {
      setError("Describe the problem statement.");
      return;
    }
    if (!isValidHttpUrl(sourceUrl)) {
      setError("Source URL must be a valid http(s) URL.");
      return;
    }
    add({
      hackathonId,
      title: title.trim(),
      body: body.trim(),
      sourceUrl: sourceUrl.trim() || null,
    });
    setTitle("");
    setBody("");
    setSourceUrl("");
    setError(null);
    onSaved?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ps-title">Title *</Label>
        <Input
          id="ps-title"
          placeholder="e.g. Transit accessibility helper"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ps-body">Details *</Label>
        <Textarea
          id="ps-body"
          placeholder="What problem does it solve, for whom, and what is in scope?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ps-source">Source URL</Label>
        <Input
          id="ps-source"
          inputMode="url"
          placeholder="https://…"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="min-h-[44px] w-full sm:w-auto">
        Save problem statement
      </Button>
    </form>
  );
}
