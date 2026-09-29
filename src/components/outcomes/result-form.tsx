"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PrizeInput } from "./prize-input";

export type OutcomeResult =
  | "none"
  | "won"
  | "finalist"
  | "submitted_no_place"
  | "did_not_submit"
  | "no_show";

const RESULT_OPTIONS: { value: OutcomeResult; label: string }[] = [
  { value: "none", label: "No result yet" },
  { value: "won", label: "Won" },
  { value: "finalist", label: "Finalist" },
  { value: "submitted_no_place", label: "Submitted, no place" },
  { value: "did_not_submit", label: "Did not submit" },
  { value: "no_show", label: "No-show" },
];

export interface OutcomeRow {
  hackathonId: string;
  result: OutcomeResult;
  rank: string | null;
  prize: string | null;
  prizeAmount: string | null;
  updatedAt: string;
}

function storageKey(hackathonId: string): string {
  return `hacktrack:workspace:${hackathonId}:outcome:v1`;
}

function loadOutcome(hackathonId: string): OutcomeRow | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(hackathonId));
    if (!raw) return null;
    return JSON.parse(raw) as OutcomeRow;
  } catch {
    return null;
  }
}

export function ResultForm({
  hackathonId,
  onSaved,
}: {
  hackathonId: string;
  onSaved?: (row: OutcomeRow) => void;
}) {
  const [result, setResult] = useState<OutcomeResult>("none");
  const [rank, setRank] = useState("");
  const [prize, setPrize] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadOutcome(hackathonId);
    if (existing) {
      // Post-mount sync from localStorage (external system): stored rows can
      // only be read client-side after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(existing.result);
      setRank(existing.rank ?? "");
      setPrize(existing.prize ?? "");
      setPrizeAmount(existing.prizeAmount ?? "");
      setSavedAt(existing.updatedAt);
    }
    setHydrated(true);
  }, [hackathonId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const row: OutcomeRow = {
      hackathonId,
      result,
      rank: rank.trim() || null,
      prize: prize.trim() || null,
      prizeAmount: prizeAmount.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(storageKey(hackathonId), JSON.stringify(row));
    } catch {
      // storage full / private mode — non-fatal
    }
    setSavedAt(row.updatedAt);
    onSaved?.(row);
  }

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="result-status">Result</Label>
        <Select
          id="result-status"
          value={result}
          onChange={(e) => setResult(e.target.value as OutcomeResult)}
          options={RESULT_OPTIONS}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="result-rank">Rank</Label>
        <Input
          id="result-rank"
          placeholder="e.g. 1st, Top 8 / 60"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
        />
      </div>
      <PrizeInput
        prize={prize}
        amount={prizeAmount}
        onPrizeChange={setPrize}
        onAmountChange={setPrizeAmount}
      />
      {savedAt && (
        <p className="text-xs text-muted-foreground">
          Last saved {new Date(savedAt).toLocaleString()}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit" className="min-h-[44px] w-full sm:w-auto">
          Save result
        </Button>
        <a
          href={`/hackathons/${hackathonId}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to hackathon
        </a>
      </div>
    </form>
  );
}
