"use client";

import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/ideation/chat-window";

/**
 * B3 — workspace ideation route (`/workspace/[hackathonId]/ideate`).
 * Client component using `useParams` (same pattern as
 * `/hackathons/[id]`). Back-links are plain `<a>` per the
 * cross-cutting flow (no shared layout edits).
 */
export default function IdeatePage() {
  const params = useParams<{ hackathonId: string }>();
  const hackathonId = params.hackathonId;

  if (!hackathonId) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <nav className="flex gap-2 text-sm">
        <a
          href={`/hackathons/${hackathonId}`}
          className="inline-flex min-h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          ← Back to hackathon
        </a>
        <span aria-hidden className="inline-flex items-center text-muted-foreground">
          ·
        </span>
        <a
          href="/timeline"
          className="inline-flex min-h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          Timeline
        </a>
      </nav>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Ideate</h1>
        <p className="text-sm text-muted-foreground">
          Brainstorm project directions, check them off as you build, drop
          what you cut.
        </p>
      </div>
      <ChatWindow hackathonId={hackathonId} />
    </div>
  );
}
