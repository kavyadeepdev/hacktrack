"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HackathonCard } from "@/components/hackathon/hackathon-card";
import { StatsStrip } from "@/components/hackathon/stats-strip";
import { STATUS_OPTIONS } from "@/lib/constants";
import { useHackathons } from "@/lib/store";

export default function HackathonsPage() {
  const { hackathons, hydrated } = useHackathons();
  const [filter, setFilter] = useState<string>("all");

  const rows = useMemo(() => {
    const list =
      filter === "all"
        ? hackathons
        : hackathons.filter((h) => h.status === filter);
    return [...list].sort((a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
    );
  }, [hackathons, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Tracker</h1>
          <p className="text-sm text-muted-foreground">
            {hydrated
              ? `${rows.length} of ${hackathons.length} tracked. Tap a title for rank, notes & learnings.`
              : "Filter by pipeline stage. Tap a title for rank, notes & learnings."}
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/hackathons/new">+ Add</Link>
        </Button>
      </div>

      {hydrated && <StatsStrip hackathons={hackathons} />}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map((o) => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            aria-pressed={filter === o.value}
            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium min-h-[44px] ${
              filter === o.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No hackathons tracked yet. Add your first one."
              : "No hackathons in this stage yet."}
          </p>
          <Button asChild className="mt-3">
            <Link href="/hackathons/new">Add a hackathon</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      )}
    </div>
  );
}
