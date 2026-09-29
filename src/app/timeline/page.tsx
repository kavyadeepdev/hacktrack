"use client";

import { TimelineChart } from "@/components/timeline/timeline-chart";
import { useHackathons } from "@/lib/store";
import { buildTimeline } from "@/lib/timeline/queries";

/**
 * Post-hackathon timeline route (PAY-12): chronological accumulation of
 * attended hackathons with details intact.
 */
export default function TimelinePage() {
  const { hackathons, hydrated } = useHackathons();
  const entries = hydrated ? buildTimeline(hackathons) : [];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:pb-12">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
        <p className="text-sm text-muted-foreground">
          {hydrated
            ? `${entries.length} attended ${entries.length === 1 ? "hackathon" : "hackathons"}, oldest first.`
            : "Loading your attended hackathons…"}
        </p>
      </header>
      {hydrated ? <TimelineChart entries={entries} /> : null}
    </main>
  );
}
