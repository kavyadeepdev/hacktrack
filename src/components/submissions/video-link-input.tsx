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
 * Demo video link upload (B4, PAY-18).
 * Saves the video URL to the `submissions` row keyed by `hackathonId`
 * (localStorage MVP: `hacktrack:submissions:v1`) and renders an embedded
 * player when the host allows it (YouTube / Vimeo / Loom), otherwise a link.
 *
 * Contract: sibling inputs (PPT B5, GitHub B8) share the same storage key
 * and row shape — each reads/merges its own field so saves never clobber.
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

/** Map a watch/share URL to an embeddable player URL, or null if unknown. */
export function toVideoEmbedUrl(value: string): string | null {
  let u: URL;
  try {
    u = new URL(value.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
  if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com")) {
    let id: string | null = null;
    if (host === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (u.pathname === "/watch") {
      id = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.split("/")[2] ?? null;
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/")[2] ?? null;
    }
    if (id) return `https://www.youtube.com/embed/${id}`;
    return null;
  }

  // Vimeo: vimeo.com/<numeric-id>
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
    if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    return null;
  }

  // Loom: loom.com/share/<id> or loom.com/embed/<id>
  if (host === "loom.com" || host.endsWith(".loom.com")) {
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1] ?? "";
    if (parts.includes("share") || parts.includes("embed")) {
      if (id) return `https://www.loom.com/embed/${id}`;
    }
    return null;
  }

  return null;
}

interface VideoLinkInputProps {
  hackathonId: string;
  initialUrl?: string | null;
  onSave?: (url: string | null) => void;
}

export function VideoLinkInput({ hackathonId, initialUrl, onSave }: VideoLinkInputProps) {
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
    if (row.videoUrl) {
      setUrl(row.videoUrl);
      setSavedUrl(row.videoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      writeField(hackathonId, "videoUrl", null);
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
    writeField(hackathonId, "videoUrl", trimmed);
    setSavedUrl(trimmed);
    setError(null);
    setSavedFlash(true);
    onSave?.(trimmed);
  }

  function handleClear() {
    setUrl("");
    writeField(hackathonId, "videoUrl", null);
    setSavedUrl(null);
    setError(null);
    setSavedFlash(false);
    onSave?.(null);
  }

  const embedUrl = savedUrl ? toVideoEmbedUrl(savedUrl) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Demo video</CardTitle>
        <CardDescription>
          Paste the demo/recording link. YouTube, Vimeo and Loom embed inline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-2">
          <Label htmlFor={`video-url-${hackathonId}`}>Video URL</Label>
          <Input
            id={`video-url-${hackathonId}`}
            inputMode="url"
            placeholder="https://youtube.com/watch?v=…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSavedFlash(false);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">
              Save video link
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
                  title="Demo video preview"
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This host does not allow embedding —{" "}
                <a href={savedUrl} target="_blank" rel="noreferrer" className="underline">
                  open video
                </a>
                .
              </p>
            )}
            {!embedUrl && (
              <a
                href={savedUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm underline"
              >
                {savedUrl}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
