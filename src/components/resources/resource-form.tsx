"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type ResourceTag = "docs" | "api" | "dataset" | "other";

export interface ResourceLink {
  id: string;
  hackathonId: string;
  title: string;
  url: string;
  tag: ResourceTag;
  createdAt: string;
}

export const RESOURCE_TAGS: { value: ResourceTag; label: string }[] = [
  { value: "docs", label: "Docs" },
  { value: "api", label: "API" },
  { value: "dataset", label: "Dataset" },
  { value: "other", label: "Other" },
];

function storageKey(hackathonId: string): string {
  return `hacktrack:workspace:${hackathonId}:resources:v1`;
}

function readResources(hackathonId: string): ResourceLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(hackathonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResourceLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResources(hackathonId: string, rows: ResourceLink[]) {
  try {
    window.localStorage.setItem(storageKey(hackathonId), JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `res-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ResourceForm({
  hackathonId,
  onSaved,
}: {
  hackathonId: string;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState<ResourceTag>("docs");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the resource a title.");
      return;
    }
    if (!isValidHttpUrl(url)) {
      setError("URL must be a valid http(s) URL.");
      return;
    }
    const row: ResourceLink = {
      id: newId(),
      hackathonId,
      title: title.trim(),
      url: url.trim(),
      tag,
      createdAt: new Date().toISOString(),
    };
    writeResources(hackathonId, [row, ...readResources(hackathonId)]);
    setTitle("");
    setUrl("");
    setTag("docs");
    setError(null);
    onSaved?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="res-title">Title *</Label>
        <Input
          id="res-title"
          placeholder="e.g. GTFS realtime API docs"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="res-url">URL *</Label>
        <Input
          id="res-url"
          inputMode="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="res-tag">Tag</Label>
        <Select
          id="res-tag"
          value={tag}
          onChange={(e) => setTag(e.target.value as ResourceTag)}
          options={RESOURCE_TAGS}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="min-h-[44px] w-full sm:w-auto">
        Save resource
      </Button>
    </form>
  );
}
