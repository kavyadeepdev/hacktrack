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

export interface ProblemStatement {
  id: string;
  hackathonId: string;
  title: string;
  body: string;
  sourceUrl: string | null;
  createdAt: string;
}

function storageKey(hackathonId: string): string {
  return `hacktrack:workspace:${hackathonId}:problem-statements:v1`;
}

function loadStatements(hackathonId: string): ProblemStatement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(hackathonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProblemStatement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistStatements(hackathonId: string, rows: ProblemStatement[]) {
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
  return `ps-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function useProblemStatements(hackathonId: string) {
  const [statements, setStatements] = useState<ProblemStatement[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): SSR/prerender has
    // no window, so the stored rows can only be read client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatements(loadStatements(hackathonId));
    setHydrated(true);
  }, [hackathonId]);

  function add(input: Omit<ProblemStatement, "id" | "createdAt">) {
    const row: ProblemStatement = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
    };
    setStatements((prev) => {
      const next = [row, ...prev];
      persistStatements(hackathonId, next);
      return next;
    });
    return row;
  }

  function remove(id: string) {
    setStatements((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistStatements(hackathonId, next);
      return next;
    });
  }

  return { statements, hydrated, add, remove };
}

export function ProblemStatementCard({
  statement,
  onDelete,
}: {
  statement: ProblemStatement;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{statement.title}</CardTitle>
        {statement.sourceUrl && (
          <CardDescription className="break-all">
            <a
              href={statement.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] inline-flex items-center text-primary underline-offset-4 hover:underline"
            >
              {statement.sourceUrl}
            </a>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {statement.body}
        </p>
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() => onDelete(statement.id)}
            aria-label={`Delete problem statement ${statement.title}`}
          >
            Delete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ProblemStatementList({
  hackathonId,
}: {
  hackathonId: string;
}) {
  const { statements, hydrated, remove } = useProblemStatements(hackathonId);

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (statements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No problem statements yet. Add the first one with the form above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {statements.map((s) => (
        <li key={s.id}>
          <ProblemStatementCard statement={s} onDelete={remove} />
        </li>
      ))}
    </ul>
  );
}
