"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * GitHub repo link upload (B8, PAY-22).
 * Validates `https://github.com/<owner>/<repo>` and saves `repoUrl` to the
 * `submissions` row (localStorage MVP: `hacktrack:submissions:v1`),
 * merging so B4/B5 fields are preserved.
 *
 * B8 -> B9 contract: the saved `repoUrl` is the input to tech-stack
 * detection — pass it to `<TechStackBadges repoUrl={...} />` or
 * `POST /api/techstack/detect { repoUrl }`.
 */

const STORAGE_KEY = "hacktrack:submissions:v1";

interface SubmissionRow {
  videoUrl?: string | null;
  pptUrl?: string | null;
  repoUrl?: string | null;
}

type SubmissionMap = Record<string, SubmissionRow>;

function readRow(hackathonId: string): SubmissionRow {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw) as SubmissionMap;
    return map[hackathonId] ?? {};
  } catch {
    return {};
  }
}

function writeField(hackathonId: string, field: keyof SubmissionRow, value: string | null) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const map: SubmissionMap = raw ? (JSON.parse(raw) as SubmissionMap) : {};
    map[hackathonId] = { ...(map[hackathonId] ?? {}), [field]: value };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage full / private mode — non-fatal for MVP
  }
}

export interface ParsedRepo {
  owner: string;
  repo: string;
}

const NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

/** Parse + validate a GitHub repo URL. Returns null when invalid. */
export function parseRepoUrl(value: string): ParsedRepo | null {
  let u: URL;
  try {
    u = new URL(value.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.hostname.replace(/^www\./, "").toLowerCase() !== "github.com") return null;
  const segments = u.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, "");
  if (!NAME_PATTERN.test(owner) || !NAME_PATTERN.test(repo) || !owner || !repo) {
    return null;
  }
  if (owner === "." || owner === ".." || repo === "." || repo === "..") return null;
  return { owner, repo };
}

/** Canonical `https://github.com/<owner>/<repo>` for a parsed repo. */
export function toCanonicalRepoUrl(parsed: ParsedRepo): string {
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

interface GithubLinkInputProps {
  hackathonId: string;
  initialUrl?: string | null;
  onSave?: (url: string | null, parsed?: ParsedRepo | null) => void;
}

export function GithubLinkInput({ hackathonId, initialUrl, onSave }: GithubLinkInputProps) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system) — same pattern
    // as src/lib/store.ts.
    if (initialUrl !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(initialUrl ?? "");
      setSavedUrl(initialUrl ?? null);
      return;
    }
    const row = readRow(hackathonId);
    if (row.repoUrl) {
      setUrl(row.repoUrl);
      setSavedUrl(row.repoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      writeField(hackathonId, "repoUrl", null);
      setSavedUrl(null);
      setError(null);
      setSavedFlash(true);
      onSave?.(null, null);
      return;
    }
    const parsed = parseRepoUrl(trimmed);
    if (!parsed) {
      setError("Enter a valid repo URL like https://github.com/owner/repo.");
      setSavedFlash(false);
      return;
    }
    const canonical = toCanonicalRepoUrl(parsed);
    writeField(hackathonId, "repoUrl", canonical);
    setSavedUrl(canonical);
    setError(null);
    setSavedFlash(true);
    onSave?.(canonical, parsed);
  }

  function handleClear() {
    setUrl("");
    writeField(hackathonId, "repoUrl", null);
    setSavedUrl(null);
    setError(null);
    setSavedFlash(false);
    onSave?.(null, null);
  }

  const parsed = savedUrl ? parseRepoUrl(savedUrl) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">GitHub repo</CardTitle>
        <CardDescription>
          Paste the project repo. The saved URL feeds tech-stack detection (B9).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-2">
          <Label htmlFor={`repo-url-${hackathonId}`}>Repo URL</Label>
          <Input
            id={`repo-url-${hackathonId}`}
            inputMode="url"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSavedFlash(false);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">
              Save repo link
            </Button>
            {savedUrl && (
              <Button type="button" variant="outline" onClick={handleClear} className="w-full sm:w-auto">
                Clear
              </Button>
            )}
          </div>
          {savedFlash && !error && (
            <p className="text-sm text-muted-foreground">Saved to submissions.</p>
          )}
        </form>

        {savedUrl && parsed && (
          <p className="truncate text-sm text-muted-foreground">
            <a
              href={savedUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {parsed.owner}/{parsed.repo}
            </a>{" "}
            — feed this URL to tech-stack detection.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
