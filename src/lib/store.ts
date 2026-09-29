/**
 * Client-side MVP store (localStorage) so the UI is fully usable
 * before Neon is wired up. Replaced by server actions + Drizzle later.
 * See `docs/architecture.md` and `docs/data-model.md`.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Hackathon, NewHackathon } from "@/lib/types";
import { SEED_HACKATHONS } from "@/lib/seed";

const KEY = "hacktrack:hackathons:v1";

function load(): Hackathon[] {
  if (typeof window === "undefined") return SEED_HACKATHONS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED_HACKATHONS));
      return SEED_HACKATHONS;
    }
    return JSON.parse(raw) as Hackathon[];
  } catch {
    return SEED_HACKATHONS;
  }
}

function persist(rows: Hackathon[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // storage full / private mode — non-fatal for MVP
  }
}

export function useHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): SSR/prerender has
    // no window, so the stored rows can only be read client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHackathons(load());
    setHydrated(true);
  }, []);

  const add = useCallback((input: NewHackathon) => {
    const now = new Date().toISOString();
    const row: Hackathon = {
      ...input,
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `local-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setHackathons((prev) => {
      const next = [row, ...prev];
      persist(next);
      return next;
    });
    return row;
  }, []);

  const update = useCallback((id: string, patch: Partial<Hackathon>) => {
    setHackathons((prev) => {
      const next = prev.map((h) =>
        h.id === id
          ? { ...h, ...patch, updatedAt: new Date().toISOString() }
          : h
      );
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHackathons((prev) => {
      const next = prev.filter((h) => h.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { hackathons, hydrated, add, update, remove };
}
