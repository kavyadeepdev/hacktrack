/**
 * localStorage MVP store for deadlines (Track B — PAY-15 / B1).
 * Mirrors the `useHackathons()` pattern: fully client-side until Neon
 * is wired up. Server components / API routes must NOT import this
 * (window access); they use `./reminders.ts` pure helpers instead.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Deadline, DeadlineType, NewDeadline } from "./types";

const KEY = "hacktrack:deadlines:v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `deadline-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function loadAll(): Deadline[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Deadline[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAll(rows: Deadline[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal for MVP
  }
}

export type DeadlinePatch = Partial<
  Pick<Deadline, "title" | "dueDate" | "type" | "notes">
> & { type?: DeadlineType };

export function sortByDueDate(rows: Deadline[]): Deadline[] {
  return [...rows].sort(
    (a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate)
  );
}

export function useDeadlines(hackathonId: string) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): SSR/prerender
    // has no window, so stored rows can only be read client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeadlines(
      sortByDueDate(loadAll().filter((d) => d.hackathonId === hackathonId))
    );
    setHydrated(true);
  }, [hackathonId]);

  const add = useCallback(
    (input: Omit<NewDeadline, "hackathonId">) => {
      const now = new Date().toISOString();
      const row: Deadline = {
        id: makeId(),
        hackathonId,
        title: input.title.trim(),
        dueDate: input.dueDate,
        type: input.type,
        notes: input.notes?.trim() ? input.notes.trim() : null,
        createdAt: now,
        updatedAt: now,
      };
      setDeadlines((prev) => {
        const next = sortByDueDate([...prev, row]);
        persistAll([
          ...loadAll().filter((d) => d.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
      return row;
    },
    [hackathonId]
  );

  const update = useCallback(
    (id: string, patch: DeadlinePatch) => {
      setDeadlines((prev) => {
        const next = sortByDueDate(
          prev.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...patch,
                  title: patch.title !== undefined ? patch.title.trim() : d.title,
                  updatedAt: new Date().toISOString(),
                }
              : d
          )
        );
        persistAll([
          ...loadAll().filter((d) => d.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
    },
    [hackathonId]
  );

  const remove = useCallback(
    (id: string) => {
      setDeadlines((prev) => {
        const next = prev.filter((d) => d.id !== id);
        persistAll([
          ...loadAll().filter((d) => d.hackathonId !== hackathonId),
          ...next,
        ]);
        return next;
      });
    },
    [hackathonId]
  );

  return { deadlines, hydrated, add, update, remove };
}
