"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEADLINE_TYPE_OPTIONS,
  type DeadlineType,
} from "@/lib/deadlines/types";

interface DeadlineFormProps {
  submitting?: boolean;
  submitLabel?: string;
  initial?: { title?: string; dueDate?: string; type?: DeadlineType; notes?: string };
  onSubmit: (input: {
    title: string;
    dueDate: string;
    type: DeadlineType;
    notes: string | null;
  }) => void;
}

export function DeadlineForm({
  submitting = false,
  submitLabel = "Add deadline",
  initial,
  onSubmit,
}: DeadlineFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [type, setType] = useState<DeadlineType>(initial?.type ?? "submission");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the deadline a title.");
      return;
    }
    if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
      setError("Pick a valid due date and time.");
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(),
      dueDate,
      type,
      notes: notes.trim() ? notes.trim() : null,
    });
    if (!initial) {
      setTitle("");
      setDueDate("");
      setNotes("");
      setType("submission");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="deadline-title">Title *</Label>
        <Input
          id="deadline-title"
          placeholder="e.g. Devpost submission"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="deadline-due">Due date *</Label>
          <Input
            id="deadline-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline-type">Type</Label>
          <Select
            id="deadline-type"
            value={type}
            onChange={(e) => setType(e.target.value as DeadlineType)}
            options={DEADLINE_TYPE_OPTIONS}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deadline-notes">Notes (optional)</Label>
        <Textarea
          id="deadline-notes"
          placeholder="Where to submit, judging criteria…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
