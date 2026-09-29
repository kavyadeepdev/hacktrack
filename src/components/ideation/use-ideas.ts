/**
 * localStorage MVP store for ideas (Track B — PAY-17 / B3).
 * Client-only (window access). Mirrors the `useHackathons()` pattern
 * without importing it — duplication beats shared edits across tracks.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Idea, IdeaStatus } from "./types";

const KEY = "hacktrack:ideas:v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idea-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function loadAll(): Idea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Idea[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAll(rows: Idea[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal for MVP
  }
}

function sortByRecent(rows: Idea[]): Idea[] {
  return [...rows].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function useIdeas(hackathonId: string) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdeas(sortByRecent(loadAll().filter((i) => i.hackathonId === hackathonId)));
    setHydrated(true);
  }, [hackathonId]);

  const add = useCallback(
    (text: string) => {
      const now = new Date().toISOString();
      const row: Idea = {
        id: makeId(),
        hackathonId,
        text: text.trim(),
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      setIdeas((prev) => {
        const next = sortByRecent([...prev, row]);
        persistAll([
          ...loadAll().filter((i) => i.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
      return row;
    },
    [hackathonId]
  );

  const setStatus = useCallback(
    (id: string, status: IdeaStatus) => {
      setIdeas((prev) => {
        const next = prev.map((i) =>
          i.id === id
            ? { ...i, status, updatedAt: new Date().toISOString() }
            : i
        );
        persistAll([
          ...loadAll().filter((i) => i.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
    },
    [hackathonId]
  );

  const remove = useCallback(
    (id: string) => {
      setIdeas((prev) => {
        const next = prev.filter((i) => i.id !== id);
        persistAll([
          ...loadAll().filter((i) => i.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
    },
    [hackathonId]
  );

  return { ideas, hydrated, add, setStatus, remove };
}
