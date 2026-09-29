"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TechEntry } from "@/lib/techstack/mapping";

/**
 * Tech-stack badges (B9, PAY-23).
 * Displays the language breakdown detected from the repo URL saved by
 * `github-link-input.tsx` (B8 -> B9 contract).
 *
 * Pass `repoUrl` (auto-fetches `GET /api/techstack/detect?repoUrl=…`) or a
 * precomputed `stack` to render directly without fetching.
 */

interface DetectResponse {
  owner: string;
  repo: string;
  repoUrl: string;
  languages: Record<string, number>;
  stack: TechEntry[];
}

interface TechStackBadgesProps {
  repoUrl?: string | null;
  stack?: TechEntry[] | null;
}

export function TechStackBadges({ repoUrl, stack }: TechStackBadgesProps) {
  const [detected, setDetected] = useState<TechEntry[] | null>(stack ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStack = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/techstack/detect?repoUrl=${encodeURIComponent(url)}`
      );
      if (!res.ok) {
        let message = "Detection failed. Try again.";
        try {
          const body = (await res.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // keep default
        }
        setError(message);
        setDetected(null);
        return;
      }
      const body = (await res.json()) as DetectResponse;
      setDetected(body.stack ?? []);
    } catch {
      setError("Could not reach the detector. Try again.");
      setDetected(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sync provided stack / fetch status into local state. The network
    // fetch itself lives in the fetchStack callback (external system).
    // A caller-provided stack always wins; otherwise auto-detect from repoUrl.
    if (stack !== undefined && stack !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetected(stack);
      setError(null);
      setLoading(false);
      return;
    }
    if (repoUrl) {
      void fetchStack(repoUrl);
    } else {
      setDetected(null);
      setError(null);
      setLoading(false);
    }
  }, [repoUrl, stack, fetchStack]);

  const list = stack ?? detected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tech stack</CardTitle>
        <CardDescription>
          {repoUrl
            ? `Detected from ${repoUrl}.`
            : "Save a GitHub repo link (B8) to detect the stack."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Detecting…</p>}
        {error && !loading && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{error}</p>
            {repoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void fetchStack(repoUrl)}
              >
                Retry
              </Button>
            )}
          </div>
        )}
        {!loading && !error && (!list || list.length === 0) && (
          <p className="text-sm text-muted-foreground">
            {repoUrl ? "No languages reported for this repo." : "No repo yet."}
          </p>
        )}
        {!loading && !error && list && list.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.map((entry) => (
              <Badge key={entry.name} variant="secondary">
                {entry.name} · {entry.percent}%
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
