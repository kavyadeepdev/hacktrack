"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/hackathon/status-badge";
import { PaymentGate } from "@/components/lifecycle/payment-gate";
import { DeleteHackathonDialog } from "@/components/lifecycle/delete-hackathon-dialog";
import {
  RESULT_LABELS,
  RESULT_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { useHackathons } from "@/lib/store";
import type { HackathonStatus, ResultStatus } from "@/lib/types";

function fmt(date?: string | null) {
  if (!date) return null;
  const d = new Date(date.length <= 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HackathonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hackathons, hydrated, updateHackathon, deleteHackathon } =
    useHackathons();
  const hackathon = hackathons.find((x) => x.id === params.id);

  if (!hydrated)
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!hackathon) {
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

  const registrationUrl =
    (hackathon as unknown as { registrationUrl?: string | null })
      .registrationUrl ?? null;
  const when = [fmt(hackathon.startDate), fmt(hackathon.endDate)]
    .filter(Boolean)
    .join(" → ");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <StatusBadge status={hackathon.status} />
        <h1 className="text-2xl font-bold tracking-tight">{hackathon.name}</h1>
        {hackathon.organizer && (
          <p className="text-sm text-muted-foreground">{hackathon.organizer}</p>
        )}
        {(when || hackathon.location || hackathon.isRemote) && (
          <p className="text-sm text-muted-foreground">
            {[when, hackathon.isRemote ? "Remote" : hackathon.location]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {hackathon.applicationDeadline && (
          <p className="text-sm text-muted-foreground">
            Apply by {fmt(hackathon.applicationDeadline)}
          </p>
        )}
      </div>

      <PaymentGate hackathonId={hackathon.id} paid={!!hackathon.paymentConfirmed} onToggle={(paid) => updateHackathon(hackathon.id, { paymentConfirmed: paid })} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Pipeline status</Label>
          <Select
            id="status"
            value={hackathon.status}
            onChange={(e) =>
              updateHackathon(hackathon.id, {
                status: e.target.value as HackathonStatus,
              })
            }
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="result">Result</Label>
          <Select
            id="result"
            value={hackathon.result}
            onChange={(e) =>
              updateHackathon(hackathon.id, {
                result: e.target.value as ResultStatus,
              })
            }
            options={RESULT_OPTIONS}
          />
        </div>
      </div>

      <section className="space-y-2 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Performance</h2>
        <div className="text-sm">
          <span className="text-muted-foreground">Result: </span>
          {RESULT_LABELS[hackathon.result]}
          {hackathon.rank ? ` · ${hackathon.rank}` : ""}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rank">Rank (e.g. 1st, Top 10, #42 / 300)</Label>
          <Input
            id="rank"
            placeholder={hackathon.rank ?? "Add your rank…"}
            defaultValue={hackathon.rank ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (hackathon.rank ?? ""))
                updateHackathon(hackathon.id, { rank: v || null });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="learnings">Notes & learnings</Label>
          <Textarea
            id="learnings"
            placeholder="What worked? What would you do differently?"
            defaultValue={hackathon.learnings ?? hackathon.notes ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (hackathon.learnings ?? ""))
                updateHackathon(hackathon.id, { learnings: v || null });
            }}
          />
          <p className="text-xs text-muted-foreground">
            Autosaves on blur. Full notes / retrospective fields land with the
            Neon migration (docs/data-model.md).
          </p>
        </div>
      </section>

      {(hackathon.url || registrationUrl) && (
        <section className="space-y-2 rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Event links</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            {hackathon.url && (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={hackathon.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1"
                >
                  <ExternalLink className="size-4" /> Open event site
                </a>
              </Button>
            )}
            {registrationUrl && (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1"
                >
                  <ExternalLink className="size-4" /> Open registration
                </a>
              </Button>
            )}
          </div>
        </section>
      )}

      <Button asChild variant="secondary" className="w-full sm:w-auto">
        <Link href={`/workspace/${hackathon.id}`}>Open workspace</Link>
      </Button>

      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/hackathons">Back</Link>
        </Button>
        <DeleteHackathonDialog hackathonId={hackathon.id} hackathonName={hackathon.name} disabled={!!hackathon.paymentConfirmed} onDeleted={() => { deleteHackathon(hackathon.id); router.push("/hackathons"); }} />
      </div>
    </div>
  );
}
