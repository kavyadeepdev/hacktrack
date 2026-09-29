"use client";

import { use } from "react";
import { ResultForm } from "@/components/outcomes/result-form";
import { NotesEditor } from "@/components/outcomes/notes-editor";

/**
 * B17 — outcomes page in the design language. Result/prize editor,
 * retrospective notes, saved-state timeline note.
 */
export default function OutcomesPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3">
        <p className="text-sm text-muted-foreground">
          Record the result first — the submissions checklist reads it —
          then write the retrospective.
        </p>
      </div>

      <ResultForm hackathonId={hackathonId} />
      <NotesEditor hackathonId={hackathonId} />
    </div>
  );
}
