"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Deadline } from "@/lib/deadlines/types";
import {
  DEADLINE_TYPE_LABELS,
  DEADLINE_TYPE_OPTIONS,
  type DeadlineType,
} from "@/lib/deadlines/types";
import type { DeadlinePatch } from "@/lib/deadlines/storage";
import {
  describeDaysUntil,
  daysUntilDue,
  formatDueDate,
} from "@/lib/deadlines/reminders";

interface DeadlineDetailProps {
  deadline: Deadline;
  hackathonId: string;
  onSave: (id: string, patch: DeadlinePatch) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

function fmtStamp(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * B16 — detail / edit panel (Image 2 right + Image 3). Details/Notes tabs,
 * reschedule form, delete-with-confirm, activity timeline.
 */
export function DeadlineDetail({
  deadline,
  hackathonId,
  onSave,
  onDelete,
  onClose,
}: DeadlineDetailProps) {
  const [tab, setTab] = useState<"details" | "notes">("details");
  const [title, setTitle] = useState(deadline.title);
  const [dueDate, setDueDate] = useState(deadline.dueDate.slice(0, 16));
  const [type, setType] = useState<DeadlineType>(deadline.type);
  const [notes, setNotes] = useState(deadline.notes ?? "");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = daysUntilDue(deadline.dueDate);
  const updated = deadline.updatedAt !== deadline.createdAt;

  function handleSave() {
    if (!title.trim()) {
      setError("Give the deadline a title.");
      return;
    }
    if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
      setError("Pick a valid due date and time.");
      return;
    }
    setError(null);
    onSave(deadline.id, {
      title: title.trim(),
      dueDate,
      type,
      notes: notes.trim() ? notes.trim() : null,
    });
  }

  return (
    <aside
      aria-label={`Deadline details: ${deadline.title}`}
      className="space-y-4 rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          {days >= 0 && days <= 3 ? (
            <p className="text-xs font-semibold text-[#006BFF]">Up next</p>
          ) : null}
          <h3 className="text-base font-semibold">{deadline.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDueDate(deadline.dueDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {describeDaysUntil(days)} · {DEADLINE_TYPE_LABELS[deadline.type]}
          </p>
        </div>
        {onClose ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close details"
            className="min-h-[44px] min-w-[44px]"
            onClick={onClose}
          >
            ✕
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="min-h-[44px] flex-1 bg-[#0A2540] text-white hover:bg-[#0A2540]/90"
          onClick={() => setTab("details")}
        >
          Reschedule
        </Button>
        {confirming ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              className="min-h-[44px] flex-1"
              onClick={() => onDelete(deadline.id)}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-[44px] flex-1"
              onClick={() => setConfirming(false)}
            >
              Keep
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="min-h-[44px] flex-1 text-destructive"
            onClick={() => setConfirming(true)}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b" role="tablist" aria-label="Detail tabs">
        {(["details", "notes"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "inline-flex min-h-[44px] items-center border-b-2 border-[#006BFF] text-sm font-semibold text-[#006BFF]"
                : "inline-flex min-h-[44px] items-center border-b-2 border-transparent text-sm text-muted-foreground"
            }
          >
            {t === "details" ? "Details" : "Notes"}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <div className="space-y-4" role="tabpanel">
          <div className="space-y-1.5">
            <Label htmlFor={`detail-title-${deadline.id}`}>Title</Label>
            <Input
              id={`detail-title-${deadline.id}`}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`detail-due-${deadline.id}`}>Due date</Label>
              <Input
                id={`detail-due-${deadline.id}`}
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`detail-type-${deadline.id}`}>Type</Label>
              <Select
                id={`detail-type-${deadline.id}`}
                value={type}
                onChange={(e) => setType(e.target.value as DeadlineType)}
                options={DEADLINE_TYPE_OPTIONS}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={handleSave} className="min-h-[44px] w-full sm:w-auto">
            Save changes
          </Button>

          <section aria-label="Reminders" className="space-y-2 border-t pt-3">
            <h4 className="text-sm font-semibold">Reminders</h4>
            <p className="flex items-center gap-2 text-sm">
              <Badge variant={days < 0 ? "destructive" : days <= 3 ? "secondary" : "outline"}>
                {describeDaysUntil(days)}
              </Badge>
              <span className="text-muted-foreground">
                Due-soon window: 3 days
              </span>
            </p>
          </section>

          <section aria-label="Type and source" className="space-y-2 border-t pt-3">
            <h4 className="text-sm font-semibold">Type &amp; source</h4>
            <p className="text-sm text-muted-foreground">
              {DEADLINE_TYPE_LABELS[deadline.type]} ·{" "}
              <a
                href={`/hackathons/${hackathonId}`}
                className="inline-flex min-h-[44px] items-center text-[#006BFF] underline-offset-4 hover:underline"
              >
                Back to hackathon
              </a>
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-4" role="tabpanel">
          <div className="space-y-1.5">
            <Label htmlFor={`detail-notes-${deadline.id}`}>Notes</Label>
            <Textarea
              id={`detail-notes-${deadline.id}`}
              value={notes}
              maxLength={500}
              placeholder="Where to submit, judging criteria…"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} variant="outline" className="min-h-[44px] w-full sm:w-auto">
            Save notes
          </Button>

          <section aria-label="Activity" className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-semibold">Activity</h4>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm">
                <span aria-hidden>📅</span>
                <div className="min-w-0 flex-1">
                  <p>
                    You created this deadline{" "}
                    <span className="text-muted-foreground">
                      {fmtStamp(deadline.createdAt)}
                    </span>
                  </p>
                  <div className="mt-1 rounded-lg border p-3">
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-muted-foreground">
                      {formatDueDate(deadline.dueDate)}
                    </p>
                  </div>
                </div>
              </li>
              {updated ? (
                <li className="flex gap-2 text-sm">
                  <span aria-hidden>✏️</span>
                  <p className="min-w-0 flex-1">
                    You edited this deadline{" "}
                    <span className="text-muted-foreground">
                      {fmtStamp(deadline.updatedAt)}
                    </span>
                  </p>
                </li>
              ) : null}
              {deadline.notes ? (
                <li className="flex gap-2 text-sm">
                  <span aria-hidden>📝</span>
                  <div className="min-w-0 flex-1">
                    <p>Note</p>
                    <div className="mt-1 rounded-lg border p-3 text-muted-foreground">
                      {deadline.notes}
                    </div>
                  </div>
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      )}
    </aside>
  );
}
