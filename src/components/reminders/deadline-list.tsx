"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadlineForm } from "./deadline-form";
import { useDeadlines } from "@/lib/deadlines/storage";
import {
  DEADLINE_TYPE_LABELS,
  type Deadline,
} from "@/lib/deadlines/types";
import {
  describeDaysUntil,
  daysUntilDue,
  formatDueDate,
} from "@/lib/deadlines/reminders";

interface DeadlineListProps {
  hackathonId: string;
}

function stateVariant(days: number): "destructive" | "secondary" | "outline" {
  if (days < 0) return "destructive";
  if (days <= 3) return "secondary";
  return "outline";
}

function DeadlineRow({
  deadline,
  onSave,
  onDelete,
}: {
  deadline: Deadline;
  onSave: (id: string, patch: { title: string; dueDate: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(deadline.title);
  const [dueDate, setDueDate] = useState(deadline.dueDate.slice(0, 16));
  const days = daysUntilDue(deadline.dueDate);

  if (editing) {
    return (
      <li className="space-y-2 rounded-lg border p-3">
        <input
          aria-label="Deadline title"
          className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <input
          aria-label="Deadline due date"
          type="datetime-local"
          className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="min-h-[44px] flex-1"
            disabled={!title.trim() || !dueDate}
            onClick={() => {
              onSave(deadline.id, { title: title.trim(), dueDate });
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-[44px] flex-1"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold">{deadline.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDueDate(deadline.dueDate)} ·{" "}
            {DEADLINE_TYPE_LABELS[deadline.type]}
          </p>
          {deadline.notes ? (
            <p className="text-sm text-muted-foreground">{deadline.notes}</p>
          ) : null}
        </div>
        <Badge variant={stateVariant(days)}>{describeDaysUntil(days)}</Badge>
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] flex-1"
          onClick={() => {
            setTitle(deadline.title);
            setDueDate(deadline.dueDate.slice(0, 16));
            setEditing(true);
          }}
        >
          Edit
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
            className="min-h-[44px] flex-1"
            onClick={() => setConfirming(true)}
          >
            Delete
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * B1 — multiple deadlines per hackathon with full CRUD.
 * Drop-in for the workspace Resources/Overview tab:
 * `<DeadlineList hackathonId={id} />`.
 */
export function DeadlineList({ hackathonId }: DeadlineListProps) {
  const { deadlines, hydrated, add, update, remove } =
    useDeadlines(hackathonId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Deadlines</CardTitle>
          <Badge variant="secondary">{deadlines.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DeadlineForm onSubmit={(input) => add(input)} />
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deadlines yet. Add the first one above — application,
            submission, demo day.
          </p>
        ) : (
          <ul className="space-y-2">
            {deadlines.map((d) => (
              <DeadlineRow
                key={d.id}
                deadline={d}
                onSave={(id, patch) => update(id, patch)}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
