"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/hackathon/status-badge";
import { RESULT_LABELS, RESULT_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { useHackathons } from "@/lib/store";
import type { HackathonStatus, ResultStatus } from "@/lib/types";

export default function HackathonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hackathons, hydrated, update, remove } = useHackathons();
  const h = hackathons.find((x) => x.id === params.id);

  if (!hydrated) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!h) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Not found</h1>
        <p className="text-sm text-muted-foreground">
          This entry may have been deleted (or stored on another device — the
          MVP uses localStorage until Neon is connected).
        </p>
        <Button asChild>
          <Link href="/hackathons">Back to tracker</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <StatusBadge status={h.status} />
        <h1 className="text-2xl font-bold tracking-tight">{h.name}</h1>
        {h.organizer && (
          <p className="text-sm text-muted-foreground">{h.organizer}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Pipeline status</Label>
          <Select
            id="status"
            value={h.status}
            onChange={(e) =>
              update(h.id, { status: e.target.value as HackathonStatus })
            }
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="result">Result</Label>
          <Select
            id="result"
            value={h.result}
            onChange={(e) =>
              update(h.id, { result: e.target.value as ResultStatus })
            }
            options={RESULT_OPTIONS}
          />
        </div>
      </div>

      <section className="space-y-2 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Performance</h2>
        <div className="text-sm">
          <span className="text-muted-foreground">Result: </span>
          {RESULT_LABELS[h.result]}
          {h.rank ? ` · ${h.rank}` : ""}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rank">Rank (e.g. 1st, Top 10, #42 / 300)</Label>
          <Input
            id="rank"
            placeholder={h.rank ?? "Add your rank…"}
            defaultValue={h.rank ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (h.rank ?? "")) update(h.id, { rank: v || null });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="learnings">Notes & learnings</Label>
          <Textarea
            id="learnings"
            placeholder="What worked? What would you do differently?"
            defaultValue={h.learnings ?? h.notes ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (h.learnings ?? "")) update(h.id, { learnings: v || null });
            }}
          />
          <p className="text-xs text-muted-foreground">
            Autosaves on blur. Full notes / retrospective fields land with the
            Neon migration (docs/data-model.md).
          </p>
        </div>
      </section>

      {h.url && (
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={h.url} target="_blank" rel="noreferrer">
            Open event site
          </a>
        </Button>
      )}

      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/hackathons">Back</Link>
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => {
            if (confirm("Delete this entry?")) {
              remove(h.id);
              router.push("/hackathons");
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
