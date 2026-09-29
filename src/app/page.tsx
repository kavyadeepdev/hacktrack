"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HackathonCard } from "@/components/hackathon/hackathon-card";
import { StatsStrip } from "@/components/hackathon/stats-strip";
import { StatusBadge } from "@/components/hackathon/status-badge";
import { useHackathons } from "@/lib/store";

export default function Home() {
  const { hackathons, hydrated } = useHackathons();
  const upcoming = [...hackathons]
    .filter((h) => ["reviewing", "planning_to_apply", "applied", "accepted"].includes(h.status))
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))
    .slice(0, 3);
  const recentResults = hackathons
    .filter((h) => h.status === "attended")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Which hackathon is next?
        </h1>
        <p className="text-sm text-muted-foreground">
          Review → apply → attend → record rank, notes and learnings.
        </p>
      </section>

      {hydrated && <StatsStrip hackathons={hackathons} />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Up next</h2>
          <Link href="/hackathons" className="text-sm font-medium underline">
            View all
          </Link>
        </div>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing in the pipeline. Add the next one you’re reviewing.
            </p>
            <Button asChild className="mt-3">
              <Link href="/hackathons/new">Add a hackathon</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        )}
      </section>

      {recentResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Recent results</h2>
          <div className="space-y-2">
            {recentResults.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2 rounded-lg border bg-muted/40 p-4">
        <h2 className="text-sm font-semibold">Pipeline</h2>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "reviewing",
              "planning_to_apply",
              "applied",
              "accepted",
              "attended",
            ] as const
          ).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Full data model (results, ranks, learnings) → docs/data-model.md
        </p>
      </section>
    </div>
  );
}
