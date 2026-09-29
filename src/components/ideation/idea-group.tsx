"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface IdeaGroupProps {
  title: string;
  count: number;
  emptyHint: string;
  children: ReactNode;
}

/**
 * B3 — groups idea rows into Implemented / Dropped sections
 * with a count badge.
 */
export function IdeaGroup({ title, count, emptyHint, children }: IdeaGroupProps) {
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {title}
        <Badge variant="secondary">{count}</Badge>
      </h3>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </section>
  );
}
