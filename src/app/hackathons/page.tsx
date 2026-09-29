"use client";

import { useMemo, useState } from "react";
import { HackathonCard } from "@/components/hackathon/hackathon-card";
import { STATUS_OPTIONS } from "@/lib/constants";
import { useHackathons } from "@/lib/store";

export default function HackathonsPage() {
  const { hackathons, hydrated } = useHackathons();
  const [filter, setFilter] = useState<string>("all");

  const rows = useMemo(
    () =>
      filter === "all"
        ? hackathons
        : hackathons.filter((h) => h.status === filter),
    [hackathons, filter]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Filter by pipeline stage. Tap a card for rank, notes & learnings.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map((o) => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium min-h-[40px] ${
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
        <p className="text-sm text-muted-foreground">
          No hackathons in this stage yet.
        </p>
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
