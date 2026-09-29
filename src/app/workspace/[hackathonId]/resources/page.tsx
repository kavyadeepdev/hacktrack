"use client";

import { use } from "react";
import { useState } from "react";
import { ProblemStatementForm } from "@/components/resources/problem-statement-form";
import { ProblemStatementList } from "@/components/resources/problem-statement-card";
import { ResourceForm } from "@/components/resources/resource-form";
import { ResourceList } from "@/components/resources/resource-list";

/**
 * B17 — resources page in the design language. Search toolbar + two
 * list/detail sections (problem statements, link library) reusing the
 * grouped-list + edit-panel rhythm from the schedule views.
 */
export default function ResourcesPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  const [showPsForm, setShowPsForm] = useState(false);
  const [showResForm, setShowResForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3">
        <p className="text-sm text-muted-foreground">
          Two libraries: problem statements first, then docs, APIs and
          datasets (filterable by tag).
        </p>
      </div>

      <section aria-label="Problem statements" className="space-y-3">
        <div className="flex min-h-[44px] items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Problem statements</h2>
          <button
            type="button"
            aria-expanded={showPsForm}
            onClick={() => setShowPsForm((s) => !s)}
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#006BFF] underline-offset-4 hover:underline"
          >
            {showPsForm ? "Close" : "New statement"}
          </button>
        </div>
        {showPsForm ? <ProblemStatementForm hackathonId={hackathonId} /> : null}
        <ProblemStatementList hackathonId={hackathonId} />
      </section>

      <section aria-label="Link library" className="space-y-3">
        <div className="flex min-h-[44px] items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Link library</h2>
          <button
            type="button"
            aria-expanded={showResForm}
            onClick={() => setShowResForm((s) => !s)}
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#006BFF] underline-offset-4 hover:underline"
          >
            {showResForm ? "Close" : "New link"}
          </button>
        </div>
        {showResForm ? <ResourceForm hackathonId={hackathonId} /> : null}
        <ResourceList hackathonId={hackathonId} />
      </section>
    </div>
  );
}
