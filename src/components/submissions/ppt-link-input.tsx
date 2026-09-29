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
 * Slide-deck link upload (B5, PAY-19).
 * Same `submissions` row pattern as B4: merges `pptUrl` into
 * localStorage MVP key `hacktrack:submissions:v1` without clobbering
 * sibling fields (`videoUrl`, `repoUrl`).
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

export function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Map a deck share URL to an embeddable URL, or null when unknown. */
export function toDeckEmbedUrl(value: string): string | null {
  let u: URL;
  try {
    u = new URL(value.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  // Google Slides: /presentation/d/<id>/edit|pub... -> /embed
  if (host === "docs.google.com" && u.pathname.includes("/presentation/")) {
    const match = u.pathname.match(/\/presentation\/d\/([A-Za-z0-9-_]+)/);
    if (match?.[1]) {
      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false`;
    }
    return null;
  }

  // Canva: /design/<id>/view... -> keep view with ?embed appended
  if (host === "canva.com" || host.endsWith(".canva.com")) {
    if (u.pathname.includes("/design/") && u.pathname.includes("/view")) {
      u.searchParams.set("embed", "");
      return u.toString();
    }
    return null;
  }

  // Pitch: pitch.com/... decks generally embed via /embed suffix
  if (host === "pitch.com" || host.endsWith(".pitch.com")) {
    if (!u.pathname.endsWith("/embed")) return `${u.origin}${u.pathname}/embed`;
    return u.toString();
  }

  return null;
}

interface PptLinkInputProps {
  hackathonId: string;
  initialUrl?: string | null;
  onSave?: (url: string | null) => void;
}

export function PptLinkInput({ hackathonId, initialUrl, onSave }: PptLinkInputProps) {
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
    if (row.pptUrl) {
      setUrl(row.pptUrl);
      setSavedUrl(row.pptUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      writeField(hackathonId, "pptUrl", null);
      setSavedUrl(null);
      setError(null);
      setSavedFlash(true);
      onSave?.(null);
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
      setError("Enter a valid http(s) URL.");
      setSavedFlash(false);
      return;
    }
    writeField(hackathonId, "pptUrl", trimmed);
    setSavedUrl(trimmed);
    setError(null);
    setSavedFlash(true);
    onSave?.(trimmed);
  }

  function handleClear() {
    setUrl("");
    writeField(hackathonId, "pptUrl", null);
    setSavedUrl(null);
    setError(null);
    setSavedFlash(false);
    onSave?.(null);
  }

  const embedUrl = savedUrl ? toDeckEmbedUrl(savedUrl) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Slide deck</CardTitle>
        <CardDescription>
          Paste the pitch-deck link. Google Slides, Canva and Pitch embed inline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-2">
          <Label htmlFor={`ppt-url-${hackathonId}`}>Deck URL</Label>
          <Input
            id={`ppt-url-${hackathonId}`}
            inputMode="url"
            placeholder="https://docs.google.com/presentation/…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSavedFlash(false);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">
              Save deck link
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

        {savedUrl && isValidHttpUrl(savedUrl) && (
          <div className="space-y-2">
            {embedUrl ? (
              <div className="overflow-hidden rounded-md border">
                <iframe
                  src={embedUrl}
                  title="Slide deck preview"
                  className="aspect-video w-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This host does not allow embedding —{" "}
                <a href={savedUrl} target="_blank" rel="noreferrer" className="underline">
                  open deck
                </a>
                .
              </p>
            )}
            <a
              href={savedUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm underline"
            >
              {savedUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
