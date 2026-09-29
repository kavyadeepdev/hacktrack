"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildIcs, downloadIcs } from "@/lib/deadlines/ics-export";
import type { Deadline } from "@/lib/deadlines/types";

export interface SubmissionState {
  videoUrl?: string | null;
  pptUrl?: string | null;
  repoUrl?: string | null;
  /** Result recorded (e.g. "won", "finalist", "submitted"). `none`/empty = missing. */
  result?: string | null;
}

interface SubmissionChecklistProps {
  submission: SubmissionState;
  /** Optional: enables the "Download calendar (.ics)" export. */
  deadlines?: Deadline[];
  hackathonId?: string;
}

function isPresent(value?: string | null): boolean {
  return !!value && value.trim().length > 0;
}

function isResultRecorded(result?: string | null): boolean {
  if (!result) return false;
  const v = result.trim().toLowerCase();
  return v.length > 0 && v !== "none";
}

/**
 * B13 — submission completeness checklist (video / PPT / repo / result)
 * plus the deadlines `.ics` export. Props-driven: parent pages pass
 * the `submissions` row fields (B4/B5/B8/B10) without shared stores.
 */
export function SubmissionChecklist({
  submission,
  deadlines = [],
  hackathonId = "hackathon",
}: SubmissionChecklistProps) {
  const [exported, setExported] = useState(false);

  const items = [
    {
      key: "video",
      label: "Demo video link",
      done: isPresent(submission.videoUrl),
      hint: submission.videoUrl ?? "Add the demo video URL (B4).",
    },
    {
      key: "ppt",
      label: "Slide deck link",
      done: isPresent(submission.pptUrl),
      hint: submission.pptUrl ?? "Add the PPT / deck URL (B5).",
    },
    {
      key: "repo",
      label: "GitHub repo link",
      done: isPresent(submission.repoUrl),
      hint: submission.repoUrl ?? "Add the repo URL (B8).",
    },
    {
      key: "result",
      label: "Result recorded",
      done: isResultRecorded(submission.result),
      hint: submission.result ?? "Record win / lose + prize (B10).",
    },
  ];
  const doneCount = items.filter((i) => i.done).length;

  function handleExport() {
    if (deadlines.length === 0) return;
    downloadIcs(`${hackathonId}-deadlines`, buildIcs(deadlines));
    setExported(true);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Submission checklist</CardTitle>
          <Badge variant={doneCount === items.length ? "default" : "secondary"}>
            {doneCount}/{items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <input
                type="checkbox"
                checked={item.done}
                readOnly
                tabIndex={-1}
                aria-label={`${item.label} ${item.done ? "complete" : "missing"}`}
                className="mt-0.5 size-5 min-h-[44px] min-w-[44px] shrink-0 accent-current"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.hint}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {deadlines.length > 0 ? (
          <div className="space-y-1.5">
            <Button
              variant="outline"
              onClick={handleExport}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Download calendar (.ics)
            </Button>
            {exported ? (
              <p className="text-sm text-muted-foreground">
                Exported {deadlines.length} deadline
                {deadlines.length === 1 ? "" : "s"} — import the file into
                Google / Apple Calendar.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {deadlines.length} deadline
                {deadlines.length === 1 ? "" : "s"} ready to export.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add deadlines (B1) to enable the calendar export.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
