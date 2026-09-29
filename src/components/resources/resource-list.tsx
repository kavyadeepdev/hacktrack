"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RESOURCE_TAGS, type ResourceLink, type ResourceTag } from "./resource-form";

const FILTER_OPTIONS = [
  { value: "all", label: "All tags" },
  ...RESOURCE_TAGS,
];

function storageKey(hackathonId: string): string {
  return `hacktrack:workspace:${hackathonId}:resources:v1`;
}

function loadResources(hackathonId: string): ResourceLink[] {
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

function persistResources(hackathonId: string, rows: ResourceLink[]) {
  try {
    window.localStorage.setItem(storageKey(hackathonId), JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal
  }
}

export function useResources(hackathonId: string) {
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): SSR/prerender has
    // no window, so the stored rows can only be read client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResources(loadResources(hackathonId));
    setHydrated(true);
  }, [hackathonId]);

  function refresh() {
    setResources(loadResources(hackathonId));
  }

  function remove(id: string) {
    setResources((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persistResources(hackathonId, next);
      return next;
    });
  }

  return { resources, hydrated, refresh, remove };
}

export function ResourceList({ hackathonId }: { hackathonId: string }) {
  const { resources, hydrated, remove } = useResources(hackathonId);
  const [filter, setFilter] = useState<string>("all");

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const visible =
    filter === "all"
      ? resources
      : resources.filter((r) => r.tag === (filter as ResourceTag));

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="res-filter">Filter by tag</Label>
        <Select
          id="res-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={FILTER_OPTIONS}
        />
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No resources yet. Save docs, APIs, or datasets with the form above.
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing tagged {filter} yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <li key={r.id}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base break-words">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] inline-flex items-center text-primary underline-offset-4 hover:underline"
                    >
                      {r.title}
                    </a>
                  </CardTitle>
                  <Badge variant="secondary">{r.tag}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {r.url}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] shrink-0"
                    onClick={() => remove(r.id)}
                    aria-label={`Delete resource ${r.title}`}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
