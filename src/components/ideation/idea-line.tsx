"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IdeaCheckbox } from "./idea-checkbox";
import type { Idea } from "./types";

interface IdeaLineProps {
  idea: Idea;
  onToggleImplemented: (id: string, implemented: boolean) => void;
  onDrop: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * B3 — one ideation row: checkbox + text + drop/restore/delete.
 * Dropped rows render muted with a Restore action.
 */
export function IdeaLine({
  idea,
  onToggleImplemented,
  onDrop,
  onRestore,
  onDelete,
}: IdeaLineProps) {
  const [confirming, setConfirming] = useState(false);
  const implemented = idea.status === "implemented";
  const dropped = idea.status === "dropped";

  return (
    <li
      className={`flex items-start gap-2 rounded-lg border p-2 ${
        dropped ? "opacity-60" : ""
      }`}
    >
      <IdeaCheckbox
        checked={implemented}
        onChange={(checked) => onToggleImplemented(idea.id, checked)}
        label={implemented ? `Mark "${idea.text}" as draft` : `Mark "${idea.text}" as implemented`}
      />
      <p
        className={`min-w-0 flex-1 pt-2.5 text-sm ${
          implemented ? "line-through text-muted-foreground" : ""
        }`}
      >
        {idea.text}
      </p>
      {dropped ? (
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] shrink-0"
          onClick={() => onRestore(idea.id)}
        >
          Restore
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] shrink-0"
          onClick={() => onDrop(idea.id)}
        >
          Drop
        </Button>
      )}
      {confirming ? (
        <Button
          size="sm"
          variant="destructive"
          className="min-h-[44px] shrink-0"
          onClick={() => onDelete(idea.id)}
        >
          Confirm
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px] shrink-0"
          aria-label={`Delete "${idea.text}"`}
          onClick={() => setConfirming(true)}
        >
          ✕
        </Button>
      )}
    </li>
  );
}
