"use client";

import { use } from "react";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";

/**
 * B15 — workspace shell. Back-links (plain `<a>` per cross-cutting flow),
 * title block, tab bar, child content. Client layout (params-as-Promise).
 */
export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <nav className="flex gap-2 text-sm" aria-label="Back">
        <a
          href={`/hackathons/${hackathonId}`}
          className="inline-flex min-h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          ← Back to hackathon
        </a>
        <span aria-hidden className="inline-flex items-center text-muted-foreground">
          ·
        </span>
        <a
          href="/timeline"
          className="inline-flex min-h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          Timeline
        </a>
      </nav>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Plan deadlines, collect resources, ship the submission.
        </p>
      </div>
      <WorkspaceTabs hackathonId={hackathonId} />
      {children}
    </div>
  );
}
